const db = require('../config/database');

class StudentsModel {
    async createStudentWithTransaction(userData, studentData) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Insert User
            const [userResult] = await connection.execute(
                `INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, NOW())`,
                [userData.name, userData.email, userData.password_hash],
            );
            const userId = userResult.insertId;

            // 2. Insert Student
            const [studentResult] = await connection.execute(
                `INSERT INTO students (user_id, institution_id, class_id, is_active, created_by_user_id) 
                 VALUES (?, ?, ?, ?, ?)`,
                [userId, studentData.institution_id, studentData.class_id, true, studentData.created_by_user_id],
            );
            const studentId = studentResult.insertId;

            // 3. Assign Student Role (assuming Role ID 1 is Student, or dynamically find it)
            // Ideally we find the role_id from roles table, but for performance, we can subquery
            await connection.execute(
                `INSERT INTO user_roles (user_id, role_id) 
                 SELECT ?, role_id FROM roles WHERE name = 'Student'`,
                [userId],
            );

            await connection.commit();
            return { user_id: userId, student_id: studentId };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async getStudents(filters, pagination, sorting) {
        let query = `
            SELECT s.student_id, s.student_id as id, u.name as name, u.email, s.institution_id, s.class_id, s.is_active, u.created_at
            FROM students s
            JOIN users u ON s.user_id = u.user_id
            WHERE s.deleted_at IS NULL AND u.deleted_at IS NULL
        `;
        const params = [];

        if (filters.class_id) {
            query += ` AND s.class_id = ?`;
            params.push(filters.class_id);
        }

        if (filters.is_active !== null && filters.is_active !== undefined) {
            query += ` AND s.is_active = ?`;
            params.push(filters.is_active === 'true' || filters.is_active === true ? 1 : 0);
        }

        if (filters.search) {
            query += ` AND (u.name LIKE ? OR s.institution_id LIKE ?)`;
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        const countQuery = `SELECT COUNT(*) as total FROM (${query}) as sub`;
        const [countRows] = await db.execute(countQuery, params);
        const total = countRows[0].total;

        // Sorting mapping since name actually applies to u.name mapped to 'name'
        const allowedSortCols = {
            name: 'u.name',
            institution_id: 's.institution_id',
            class_id: 's.class_id',
            created_at: 'u.created_at',
        };
        const sortAlias = allowedSortCols[sorting.sort_by] || 'u.created_at';
        const sortOrder = sorting.order && sorting.order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        query += ` ORDER BY ${sortAlias} ${sortOrder}`;
        query += ` LIMIT ? OFFSET ?`;
        params.push(pagination.limit, pagination.offset);

        const [rows] = await db.query(query, params);
        return { rows, total };
    }

    async findById(studentId) {
        const [rows] = await db.execute(
            `SELECT s.student_id, s.student_id as id, s.user_id, u.name, u.email, s.institution_id, s.class_id, s.is_active, u.created_at
             FROM students s
             JOIN users u ON s.user_id = u.user_id
             WHERE s.student_id = ? AND s.deleted_at IS NULL AND u.deleted_at IS NULL`,
            [studentId],
        );
        return rows[0];
    }

    async findByInstitutionId(institutionId) {
        const [rows] = await db.execute(`SELECT student_id FROM students WHERE institution_id = ?`, [institutionId]);
        return rows[0];
    }

    async updateStudent(studentId, data) {
        const [result] = await db.execute(`UPDATE students SET class_id = ?, institution_id = ? WHERE student_id = ?`, [
            data.class_id,
            data.institution_id,
            studentId,
        ]);
        return result.affectedRows;
    }

    async deleteStudent(studentId) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const [studentQuery] = await connection.execute(`SELECT user_id FROM students WHERE student_id = ?`, [
                studentId,
            ]);

            if (studentQuery.length === 0) throw new Error('Student not found');
            const userId = studentQuery[0].user_id;

            // Soft delete student profile
            await connection.execute(`UPDATE students SET deleted_at = NOW() WHERE student_id = ?`, [studentId]);

            // Soft delete user profile associated
            await connection.execute(`UPDATE users SET deleted_at = NOW() WHERE user_id = ?`, [userId]);

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async setStudentStatus(studentId, isActive) {
        const [result] = await db.execute(`UPDATE students SET is_active = ? WHERE student_id = ?`, [
            isActive ? 1 : 0,
            studentId,
        ]);
        return result.affectedRows;
    }

    async getStudentSubmissions(studentId, pagination) {
        let query = `
            SELECT submission_id, sub.exam_schedule_id, st.name as type, ss.name as status, sub.submitted_at
            FROM submissions sub
            JOIN submission_types st ON sub.submission_type_id = st.submission_type_id
            JOIN submission_status ss ON sub.status_id = ss.submission_status_id
            WHERE sub.student_id = ?
            ORDER BY sub.submitted_at DESC
        `;

        const countQuery = `SELECT COUNT(*) as total FROM submissions WHERE student_id = ?`;
        const [countRows] = await db.execute(countQuery, [studentId]);
        const total = countRows[0].total;

        query += ` LIMIT ? OFFSET ?`;
        const [rows] = await db.execute(query, [studentId, pagination.limit, pagination.offset]);

        return { rows, total };
    }

    async findUserIdsByClass(classId) {
        const [rows] = await db.execute(`SELECT user_id FROM students WHERE class_id = ? AND deleted_at IS NULL`, [
            classId,
        ]);
        return rows.map((r) => r.user_id);
    }
}

module.exports = new StudentsModel();
