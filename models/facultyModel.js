const db = require('../config/database');

class FacultyModel {
    async createFacultyWithTransaction(userData, facultyData) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const [userResult] = await connection.execute(
                `INSERT INTO USERS (name, email, password_hash, created_at) VALUES (?, ?, ?, NOW())`,
                [userData.name, userData.email, userData.password_hash],
            );
            const userId = userResult.insertId;

            const [facultyResult] = await connection.execute(
                `INSERT INTO FACULTY (user_id, subject_name, is_active, credentials_sent_at) 
                 VALUES (?, ?, ?, NOW())`,
                [userId, facultyData.subject_name, true],
            );
            const facultyId = facultyResult.insertId;

            await connection.execute(
                `INSERT INTO USER_ROLES (user_id, role_id) 
                 SELECT ?, role_id FROM ROLES WHERE name = 'Faculty'`,
                [userId],
            );

            await connection.commit();
            return { user_id: userId, faculty_id: facultyId };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async getFaculty(filters, pagination) {
        let query = `
            SELECT f.faculty_id, f.faculty_id as id, u.name, u.email, f.subject_name, f.is_active, f.credentials_sent_at 
            FROM FACULTY f
            JOIN USERS u ON f.user_id = u.user_id
            WHERE f.deleted_at IS NULL AND u.deleted_at IS NULL
        `;
        const params = [];

        if (filters.subject_name) {
            query += ` AND f.subject_name = ?`;
            params.push(filters.subject_name);
        }
        if (filters.is_active !== null && filters.is_active !== undefined) {
            query += ` AND f.is_active = ?`;
            params.push(filters.is_active === 'true' || filters.is_active === true ? 1 : 0);
        }
        if (filters.search) {
            query += ` AND (u.name LIKE ? OR u.email LIKE ?)`;
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        const countQuery = `SELECT COUNT(*) as total FROM (${query}) as sub`;
        const [countRows] = await db.execute(countQuery, params);
        const total = countRows[0].total;

        query += ` ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;
        params.push(pagination.limit, pagination.offset);

        const [rows] = await db.query(query, params);
        return { rows, total };
    }

    async findById(facultyId) {
        const [rows] = await db.execute(
            `SELECT f.faculty_id, f.faculty_id as id, f.user_id, u.name, u.email, f.subject_name, f.is_active
             FROM FACULTY f
             JOIN USERS u ON f.user_id = u.user_id
             WHERE f.faculty_id = ? AND f.deleted_at IS NULL AND u.deleted_at IS NULL`,
            [facultyId],
        );
        return rows[0];
    }

    async updateFaculty(facultyId, data) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            await connection.execute(`UPDATE FACULTY SET subject_name = ? WHERE faculty_id = ?`, [
                data.subject_name,
                facultyId,
            ]);

            const [faculty] = await connection.execute(`SELECT user_id FROM FACULTY WHERE faculty_id = ?`, [facultyId]);
            if (faculty.length > 0) {
                await connection.execute(`UPDATE USERS SET name = ?, email = ? WHERE user_id = ?`, [
                    data.name,
                    data.email,
                    faculty[0].user_id,
                ]);
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async deleteFaculty(facultyId) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const [faculty] = await connection.execute(`SELECT user_id FROM FACULTY WHERE faculty_id = ?`, [facultyId]);
            if (faculty.length === 0) throw new Error('Faculty not found');
            const userId = faculty[0].user_id;

            await connection.execute(`UPDATE FACULTY SET deleted_at = NOW() WHERE faculty_id = ?`, [facultyId]);
            await connection.execute(`UPDATE USERS SET deleted_at = NOW() WHERE user_id = ?`, [userId]);

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async setFacultyStatus(facultyId, isActive) {
        const [result] = await db.execute(`UPDATE FACULTY SET is_active = ? WHERE faculty_id = ?`, [
            isActive ? 1 : 0,
            facultyId,
        ]);
        return result.affectedRows > 0;
    }

    async getFacultyAssignments(facultyId, pagination) {
        let query = `
            SELECT a.assignment_id, c.grade, c.section, c.academic_year, s.name as subject_name, s.code as subject_code
            FROM FACULTY_CLASS_SUBJECT_ASSIGNMENTS a
            JOIN CLASSES c ON a.class_id = c.class_id
            JOIN SUBJECTS s ON a.subject_id = s.subject_id
            WHERE a.faculty_id = ?
        `;

        const [countRows] = await db.execute(
            `SELECT COUNT(*) as total FROM FACULTY_CLASS_SUBJECT_ASSIGNMENTS WHERE faculty_id = ?`,
            [facultyId],
        );
        const total = countRows[0].total;

        query += ` ORDER BY a.assigned_at DESC LIMIT ? OFFSET ?`;
        const [rows] = await db.execute(query, [facultyId, pagination.limit, pagination.offset]);
        return { rows, total };
    }
    async getSubjectNamesLookup() {
        const [rows] = await db.execute(
            `SELECT DISTINCT subject_name FROM FACULTY 
             WHERE subject_name IS NOT NULL AND deleted_at IS NULL 
             ORDER BY subject_name ASC`,
        );
        return rows.map((r) => ({ name: r.subject_name }));
    }

    async getFacultyLookup() {
        const [rows] = await db.execute(
            `SELECT f.faculty_id as id, u.name, f.subject_name 
             FROM FACULTY f
             JOIN USERS u ON f.user_id = u.user_id 
             WHERE f.deleted_at IS NULL AND u.deleted_at IS NULL 
             ORDER BY u.name ASC`,
        );
        return rows;
    }
}

module.exports = new FacultyModel();
