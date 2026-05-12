const db = require('../config/database');

class AssignmentsModel {
    async createAssignment(facultyId, subjectId, classId) {
        const [result] = await db.execute(
            `INSERT INTO faculty_class_subject_assignments (faculty_id, subject_id, class_id, assigned_at) 
             VALUES (?, ?, ?, NOW())`,
            [facultyId, subjectId, classId],
        );
        return result.insertId;
    }

    async getAssignments(filters, pagination, sorting) {
        let query = `
            SELECT a.assignment_id, a.faculty_id, a.subject_id, a.class_id, a.assigned_at,
                   u.name as faculty_name, s.name as subject_name, c.grade, c.section, c.academic_year
            FROM faculty_class_subject_assignments a
            JOIN faculty f ON a.faculty_id = f.faculty_id
            JOIN users u ON f.user_id = u.user_id
            JOIN subjects s ON a.subject_id = s.subject_id
            JOIN classes c ON a.class_id = c.class_id
            WHERE u.deleted_at IS NULL AND f.deleted_at IS NULL
        `;
        const params = [];
        const conditions = [];

        if (filters.faculty_id) {
            conditions.push(`a.faculty_id = ?`);
            params.push(filters.faculty_id);
        }
        if (filters.subject_id) {
            conditions.push(`a.subject_id = ?`);
            params.push(filters.subject_id);
        }
        if (filters.class_id) {
            conditions.push(`a.class_id = ?`);
            params.push(filters.class_id);
        }

        if (conditions.length > 0) {
            query += ` AND ` + conditions.join(' AND ');
        }

        const countQuery = `SELECT COUNT(*) as total FROM (${query}) as sub`;
        const [countRows] = await db.execute(countQuery, params);
        const total = countRows[0].total;

        // Explicit mapping to prevent SQL Injection
        const sortColumnMap = {
            faculty_name: 'u.name',
            subject_name: 's.name',
            assigned_at: 'a.assigned_at',
        };
        const sortColumn = sortColumnMap[sorting.sort_by] || 'a.assigned_at';
        const sortOrder = sorting.order && sorting.order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        query += ` ORDER BY ${sortColumn} ${sortOrder} LIMIT ? OFFSET ?`;
        params.push(pagination.limit, pagination.offset);

        const [rows] = await db.query(query, params);
        return { rows, total };
    }

    async findById(assignmentId) {
        const [rows] = await db.execute(
            `SELECT a.*, u.name as faculty_name, s.name as subject_name, c.grade, c.section 
             FROM faculty_class_subject_assignments a
             JOIN faculty f ON a.faculty_id = f.faculty_id
             JOIN users u ON f.user_id = u.user_id
             JOIN subjects s ON a.subject_id = s.subject_id
             JOIN classes c ON a.class_id = c.class_id
             WHERE a.assignment_id = ?`,
            [assignmentId],
        );
        return rows[0];
    }

    async findExactDuplicate(facultyId, subjectId, classId) {
        const [rows] = await db.execute(
            `SELECT assignment_id FROM faculty_class_subject_assignments 
             WHERE faculty_id = ? AND subject_id = ? AND class_id = ?`,
            [facultyId, subjectId, classId],
        );
        return rows[0];
    }

    async updateAssignment(assignmentId, data) {
        const [result] = await db.execute(
            `UPDATE faculty_class_subject_assignments SET faculty_id = ?, subject_id = ?, class_id = ? WHERE assignment_id = ?`,
            [data.faculty_id, data.subject_id, data.class_id, assignmentId],
        );
        return result.affectedRows;
    }

    async deleteAssignment(assignmentId) {
        const [result] = await db.execute(`DELETE FROM faculty_class_subject_assignments WHERE assignment_id = ?`, [
            assignmentId,
        ]);
        return result.affectedRows;
    }
}

module.exports = new AssignmentsModel();
