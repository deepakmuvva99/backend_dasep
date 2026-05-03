const db = require('../config/database');

class EvaluationsModel {
    async createEvaluation(data) {
        // Enforce 1:1 using INSERT, DB unique constraint will catch duplicates,
        // but we handle explicitly for safety before hitting DB error
        const [existing] = await db.execute(`SELECT evaluation_id FROM EVALUATIONS WHERE submission_id = ?`, [
            data.submission_id,
        ]);
        if (existing.length > 0) return { error: 'EVALUATION_EXISTS' };

        const [result] = await db.execute(
            `INSERT INTO EVALUATIONS (submission_id, faculty_id, marks_awarded, max_marks, remarks, status_id, evaluated_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [data.submission_id, data.faculty_id, data.marks_awarded, data.max_marks, data.remarks, data.status_id],
        );
        return { evaluation_id: result.insertId };
    }

    async getEvaluations(filters, pagination, sorting, userContext) {
        let query = `
            SELECT e.evaluation_id, e.marks_awarded, e.max_marks, e.evaluated_at, est.name as status,
                   sub.submission_id, st.name as submission_type,
                   u.name as faculty_name,
                   stu_u.name as student_name
            FROM EVALUATIONS e
            JOIN EVALUATION_STATUS est ON e.status_id = est.evaluation_status_id
            JOIN SUBMISSIONS sub ON e.submission_id = sub.submission_id
            JOIN SUBMISSION_TYPES st ON sub.submission_type_id = st.submission_type_id
            JOIN FACULTY f ON e.faculty_id = f.faculty_id
            JOIN USERS u ON f.user_id = u.user_id
            JOIN STUDENTS stu ON sub.student_id = stu.student_id
            JOIN USERS stu_u ON stu.user_id = stu_u.user_id
        `;

        const params = [];
        const conditions = [];

        // Scoping
        if (userContext.role === 'Student') {
            const [stuMapping] = await db.execute(`SELECT student_id FROM STUDENTS WHERE user_id = ?`, [
                userContext.user_id,
            ]);
            const studentId = stuMapping[0] ? stuMapping[0].student_id : 0;
            conditions.push(`sub.student_id = ?`);
            params.push(studentId);
        } else if (userContext.role === 'Faculty') {
            const [facMapping] = await db.execute(`SELECT faculty_id FROM FACULTY WHERE user_id = ?`, [
                userContext.user_id,
            ]);
            const facultyId = facMapping[0] ? facMapping[0].faculty_id : 0;
            conditions.push(`e.faculty_id = ?`);
            params.push(facultyId);
        }

        if (filters.status_id) {
            conditions.push(`e.status_id = ?`);
            params.push(filters.status_id);
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        const countQuery = `SELECT COUNT(*) as total FROM (${query}) as subq`;
        const [countRows] = await db.execute(countQuery, params);
        const total = countRows[0].total;

        // Explicit mapping to prevent SQL Injection
        const sortColumnMap = {
            evaluated_at: 'e.evaluated_at',
            marks_awarded: 'e.marks_awarded',
        };
        const sortColumn = sortColumnMap[sorting.sort_by] || 'e.evaluated_at';
        const sortOrder = sorting.order && sorting.order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        query += ` ORDER BY ${sortColumn} ${sortOrder} LIMIT ? OFFSET ?`;
        params.push(pagination.limit, pagination.offset);

        const [rows] = await db.query(query, params);
        return { rows, total };
    }

    async findById(evaluationId) {
        const [rows] = await db.execute(
            `SELECT e.*, est.name as status
             FROM EVALUATIONS e
             JOIN EVALUATION_STATUS est ON e.status_id = est.evaluation_status_id
             WHERE e.evaluation_id = ?`,
            [evaluationId],
        );
        return rows[0];
    }

    async updateEvaluation(evaluationId, data) {
        const [result] = await db.execute(
            `UPDATE EVALUATIONS 
             SET marks_awarded = ?, max_marks = ?, remarks = ?, status_id = ? 
             WHERE evaluation_id = ?`,
            [data.marks_awarded, data.max_marks, data.remarks, data.status_id, evaluationId],
        );
        return result.affectedRows;
    }

    async getStatuses() {
        const [rows] = await db.execute(`SELECT evaluation_status_id as id, name, description FROM EVALUATION_STATUS`);
        return rows;
    }

    async findBySubmissionId(submissionId) {
        const [rows] = await db.execute(
            `SELECT e.*, est.name as status
             FROM EVALUATIONS e
             JOIN EVALUATION_STATUS est ON e.status_id = est.evaluation_status_id
             WHERE e.submission_id = ?`,
            [submissionId],
        );
        return rows[0];
    }

    async findByFacultyId(facultyId, pagination, filters) {
        let query = `
            SELECT e.*, est.name as status
            FROM EVALUATIONS e
            JOIN EVALUATION_STATUS est ON e.status_id = est.evaluation_status_id
            WHERE e.faculty_id = ?
        `;
        const params = [facultyId];

        if (filters.status) {
            query += ` AND est.name = ?`;
            params.push(filters.status);
        }

        const [countRows] = await db.execute(`SELECT COUNT(*) as total FROM (${query}) as sub`, params);
        const total = countRows[0].total;

        query += ` ORDER BY e.created_at DESC LIMIT ? OFFSET ?`;
        params.push(pagination.limit, pagination.offset);

        const [rows] = await db.execute(query, params);
        return { rows, total };
    }
}

module.exports = new EvaluationsModel();
