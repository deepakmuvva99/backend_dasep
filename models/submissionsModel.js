const db = require('../config/database');

class SubmissionsModel {
    async createSubmission(data) {
        // Find if this is a repeat attempt to increment attempt_number safely
        const [existing] = await db.execute(
            `SELECT MAX(attempt_number) as max_attempt 
             FROM SUBMISSIONS
             WHERE student_id = ? AND assignment_id = ? AND submission_type_id = ?`,
            [data.student_id, data.assignment_id, data.submission_type_id],
        );

        const nextAttempt = existing[0].max_attempt ? existing[0].max_attempt + 1 : 1;

        const [result] = await db.execute(
            `INSERT INTO SUBMISSIONS (student_id, assignment_id, exam_schedule_id, submission_type_id, status_id, attempt_number, submitted_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [
                data.student_id,
                data.assignment_id,
                data.exam_schedule_id || null,
                data.submission_type_id,
                data.status_id, // e.g. 1 for 'Pending'
                nextAttempt,
            ],
        );

        return result.insertId;
    }

    async getSubmissions(filters, pagination, sorting, userContext) {
        let query = `
            SELECT s.submission_id, s.attempt_number, s.submitted_at, 
                   st.name as submission_type, stat.name as status,
                   stu.institution_id as student_identifier, 
                   sub.name as subject_name, c.grade, c.section
            FROM SUBMISSIONS s
            JOIN SUBMISSION_TYPES st ON s.submission_type_id = st.submission_type_id
            JOIN SUBMISSION_STATUS stat ON s.status_id = stat.submission_status_id
            JOIN STUDENTS stu ON s.student_id = stu.student_id
            JOIN FACULTY_CLASS_SUBJECT_ASSIGNMENTS fcsa ON s.assignment_id = fcsa.assignment_id
            JOIN SUBJECTS sub ON fcsa.subject_id = sub.subject_id
            JOIN CLASSES c ON fcsa.class_id = c.class_id
        `;
        const params = [];
        const conditions = [];

        // Scoping
        if (userContext.role === 'Student') {
            // Find student_id mapping
            const [stuMapping] = await db.execute(`SELECT student_id FROM STUDENTS WHERE user_id = ?`, [
                userContext.user_id,
            ]);
            const studentId = stuMapping[0] ? stuMapping[0].student_id : 0;
            conditions.push(`s.student_id = ?`);
            params.push(studentId);
        } else if (userContext.role === 'Faculty') {
            // Find faculty_id mapping
            const [facMapping] = await db.execute(`SELECT faculty_id FROM FACULTY WHERE user_id = ?`, [
                userContext.user_id,
            ]);
            const facultyId = facMapping[0] ? facMapping[0].faculty_id : 0;
            conditions.push(`fcsa.faculty_id = ?`);
            params.push(facultyId);
        }

        if (filters.status_id) {
            conditions.push('s.status_id = ?');
            params.push(filters.status_id);
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        const countQuery = `SELECT COUNT(*) as total FROM (${query}) as sub`;
        const [countRows] = await db.execute(countQuery, params);
        const total = countRows[0].total;

        // Explicit mapping to prevent SQL Injection
        const sortColumnMap = {
            submission_id: 's.submission_id',
            submitted_at: 's.submitted_at',
            attempt_number: 's.attempt_number',
        };
        const sortColumn = sortColumnMap[sorting.sort_by] || 's.submitted_at';
        const sortOrder = sorting.order && sorting.order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        query += ` ORDER BY ${sortColumn} ${sortOrder}`;
        query += ` LIMIT ? OFFSET ?`;
        params.push(pagination.limit, pagination.offset);

        const [rows] = await db.query(query, params);
        return { rows, total };
    }

    async findById(submissionId) {
        const [rows] = await db.execute(`SELECT * FROM SUBMISSIONS WHERE submission_id = ?`, [submissionId]);
        return rows[0];
    }

    async updateStatus(submissionId, statusId) {
        const [result] = await db.execute(`UPDATE SUBMISSIONS SET status_id = ? WHERE submission_id = ?`, [
            statusId,
            submissionId,
        ]);
        return result.affectedRows;
    }
}

module.exports = new SubmissionsModel();
