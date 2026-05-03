const db = require('../config/database');

class SubjectsModel {
    async createSubject(name, code) {
        // Assume code is unique
        const [result] = await db.execute(`INSERT INTO SUBJECTS (name, code) VALUES (?, ?)`, [name, code]);
        return result.insertId;
    }

    async getSubjects(filters, pagination, sorting, userContext) {
        let query = `
            SELECT DISTINCT s.subject_id, s.subject_id as id, s.name, s.code 
            FROM SUBJECTS s
        `;
        const params = [];

        // If faculty, join with FACULTY_CLASS_SUBJECT_ASSIGNMENTS
        if (userContext.role === 'Faculty') {
            query += ` JOIN FACULTY_CLASS_SUBJECT_ASSIGNMENTS fcsa ON s.subject_id = fcsa.subject_id `;
        }
        // If filtering by class_id
        else if (filters.class_id) {
            query += ` JOIN CLASS_SUBJECTS cs ON s.subject_id = cs.subject_id `;
        }

        const conditions = [];

        if (userContext.role === 'Faculty') {
            conditions.push(`fcsa.faculty_id = ?`);
            params.push(userContext.user_id);
        }

        if (filters.class_id) {
            conditions.push(userContext.role === 'Faculty' ? `fcsa.class_id = ?` : `cs.class_id = ?`);
            params.push(filters.class_id);
        }

        if (filters.search) {
            conditions.push(`(s.name LIKE ? OR s.code LIKE ?)`);
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        // Count query
        const countQuery = `SELECT COUNT(*) as total FROM (${query}) as sub`;
        const [countRows] = await db.execute(countQuery, params);
        const total = countRows[0].total;

        // Apply sorting and pagination with explicit mapping to prevent SQL Injection
        const sortColumnMap = {
            name: 's.name',
            code: 's.code',
            subject_id: 's.subject_id',
        };
        const sortColumn = sortColumnMap[sorting.sort_by] || 's.name';
        const sortOrder = sorting.order && sorting.order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        query += ` ORDER BY ${sortColumn} ${sortOrder}`;
        query += ` LIMIT ? OFFSET ?`;
        params.push(pagination.limit, pagination.offset);

        const [rows] = await db.query(query, params);
        return { rows, total };
    }

    async findById(subjectId) {
        const [rows] = await db.execute(
            `SELECT subject_id, subject_id as id, name, code FROM SUBJECTS WHERE subject_id = ?`,
            [subjectId],
        );
        return rows[0];
    }

    async findByCode(code) {
        const [rows] = await db.execute(`SELECT * FROM SUBJECTS WHERE code = ?`, [code]);
        return rows[0];
    }

    async updateSubject(subjectId, data) {
        const [result] = await db.execute(`UPDATE SUBJECTS SET name = ?, code = ? WHERE subject_id = ?`, [
            data.name,
            data.code,
            subjectId,
        ]);
        return result.affectedRows;
    }

    async deleteSubject(subjectId) {
        // Note: Full delete cascaded to CLASS_SUBJECTS and EXAM_SCHEDULES via relations or manually
        const [result] = await db.execute(`DELETE FROM SUBJECTS WHERE subject_id = ?`, [subjectId]);
        return result.affectedRows;
    }

    async getLookup() {
        const [rows] = await db.execute(
            `SELECT subject_id as id, name, code 
             FROM SUBJECTS 
             WHERE deleted_at IS NULL 
             ORDER BY name ASC`,
        );
        return rows;
    }
}

module.exports = new SubjectsModel();
