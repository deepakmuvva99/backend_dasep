const db = require('../config/database');

class ClassesModel {
    async createClass(data) {
        const [result] = await db.execute(`INSERT INTO CLASSES (grade, section, academic_year) VALUES (?, ?, ?)`, [
            data.grade,
            data.section,
            data.academic_year,
        ]);
        return result.insertId;
    }

    async getClasses(filters, pagination, sorting) {
        let query = `SELECT *, class_id as id FROM CLASSES`;
        const params = [];
        const conditions = [];

        if (filters.grade) {
            conditions.push(`grade = ?`);
            params.push(filters.grade);
        }
        if (filters.academic_year) {
            conditions.push(`academic_year = ?`);
            params.push(filters.academic_year);
        }
        if (filters.search) {
            conditions.push(`(section LIKE ? OR grade LIKE ?)`);
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        const countQuery = `SELECT COUNT(*) as total FROM (${query}) as sub`;
        const [countRows] = await db.execute(countQuery, params);
        const total = countRows[0].total;

        // Explicit mapping to prevent SQL Injection
        const sortColumnMap = {
            grade: 'grade',
            section: 'section',
            academic_year: 'academic_year',
            class_id: 'class_id',
        };
        const sortColumn = sortColumnMap[sorting.sort_by] || 'grade';
        const sortOrder = sorting.order && sorting.order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        query += ` ORDER BY ${sortColumn} ${sortOrder} LIMIT ? OFFSET ?`;
        params.push(pagination.limit, pagination.offset);

        const [rows] = await db.query(query, params);
        return { rows, total };
    }

    async findById(classId) {
        const [rows] = await db.execute(`SELECT *, class_id as id FROM CLASSES WHERE class_id = ?`, [classId]);
        return rows[0];
    }

    async findByCombo(grade, section, academic_year) {
        const [rows] = await db.execute(`SELECT * FROM CLASSES WHERE grade = ? AND section = ? AND academic_year = ?`, [
            grade,
            section,
            academic_year,
        ]);
        return rows[0];
    }

    async updateClass(classId, data) {
        const [result] = await db.execute(
            `UPDATE CLASSES SET grade = ?, section = ?, academic_year = ? WHERE class_id = ?`,
            [data.grade, data.section, data.academic_year, classId],
        );
        return result.affectedRows;
    }

    async deleteClass(classId) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            await connection.execute(`DELETE FROM CLASS_SUBJECTS WHERE class_id = ?`, [classId]);
            await connection.execute(`DELETE FROM FACULTY_CLASS_SUBJECT_ASSIGNMENTS WHERE class_id = ?`, [classId]);
            await connection.execute(`DELETE FROM CLASSES WHERE class_id = ?`, [classId]);
            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async getClassSubjects(classId, pagination) {
        let query = `
            SELECT s.subject_id, s.name, s.code 
            FROM SUBJECTS s
            JOIN CLASS_SUBJECTS cs ON s.subject_id = cs.subject_id
            WHERE cs.class_id = ?
        `;

        const countQuery = `SELECT COUNT(*) as total FROM CLASS_SUBJECTS WHERE class_id = ?`;
        const [countRows] = await db.execute(countQuery, [classId]);
        const total = countRows[0].total;

        query += ` LIMIT ? OFFSET ?`;
        const [rows] = await db.execute(query, [classId, pagination.limit, pagination.offset]);
        return { rows, total };
    }

    async getLookup() {
        const [rows] = await db.execute(
            `SELECT class_id as id, CONCAT('Grade ', grade, ' - ', section) as name, academic_year 
             FROM CLASSES 
             WHERE deleted_at IS NULL 
             ORDER BY grade ASC, section ASC`,
        );
        return rows;
    }

    async addClassSubject(classId, subjectId) {
        const [result] = await db.execute(
            `INSERT INTO CLASS_SUBJECTS (class_id, subject_id, created_at, updated_at) 
             VALUES (?, ?, NOW(), NOW())`,
            [classId, subjectId],
        );
        return result.affectedRows > 0;
    }

    async removeClassSubject(classId, subjectId) {
        const [result] = await db.execute(`DELETE FROM CLASS_SUBJECTS WHERE class_id = ? AND subject_id = ?`, [
            classId,
            subjectId,
        ]);
        return result.affectedRows > 0;
    }

    async findClassSubject(classId, subjectId) {
        const [rows] = await db.execute(`SELECT * FROM CLASS_SUBJECTS WHERE class_id = ? AND subject_id = ?`, [
            classId,
            subjectId,
        ]);
        return rows[0];
    }
}

module.exports = new ClassesModel();
