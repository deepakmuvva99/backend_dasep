const db = require('../config/database');

class SubmissionsModel {
    async createSubmission(data) {
        const [result] = await db.execute(
            `INSERT INTO submissions (student_id, exam_schedule_id, submission_type_id, status_id, attempt_number, is_latest, submitted_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [
                data.student_id,
                data.exam_schedule_id,
                data.submission_type_id,
                data.status_id,
                data.attempt_number || 1,
                data.is_latest !== undefined ? data.is_latest : true,
            ],
        );

        return result.insertId;
    }

    async getSubmissions(filters, pagination, sorting, userContext) {
        let query = `
             SELECT s.submission_id, s.submitted_at, s.exam_schedule_id, s.attempt_number, s.is_latest,
                    es.title as task_name,
                    st.name as submission_type, stat.name as status,
                    stu.institution_id as student_identifier, 
                    sub.name as subject_name, c.grade, c.section
            FROM submissions s
            JOIN submission_types st ON s.submission_type_id = st.submission_type_id
            JOIN submission_status stat ON s.status_id = stat.submission_status_id
            JOIN students stu ON s.student_id = stu.student_id
            JOIN exam_schedules es ON s.exam_schedule_id = es.exam_schedule_id
            JOIN subjects sub ON es.subject_id = sub.subject_id
            JOIN classes c ON es.class_id = c.class_id
        `;
        const params = [];
        const conditions = [];

        // Scoping
        if (userContext.role === 'Student') {
            // Find student_id mapping
            const [stuMapping] = await db.execute(`SELECT student_id FROM students WHERE user_id = ?`, [
                userContext.user_id,
            ]);
            const studentId = stuMapping[0] ? stuMapping[0].student_id : 0;
            conditions.push(`s.student_id = ?`);
            params.push(studentId);
        } else if (userContext.role === 'Faculty') {
            // Find faculty_id mapping
            const [facMapping] = await db.execute(`SELECT faculty_id FROM faculty WHERE user_id = ?`, [
                userContext.user_id,
            ]);
            const facultyId = facMapping[0] ? facMapping[0].faculty_id : 0;
            
            // Faculty can see submissions for subjects/classes they are assigned to
query += ` JOIN faculty_class_subject_assignments fcsa ON es.subject_id = fcsa.subject_id AND es.class_id = fcsa.class_id `;
            conditions.push(`fcsa.faculty_id = ?`);
            params.push(facultyId);
        }

        if (filters.status_id) {
            conditions.push('s.status_id = ?');
            params.push(filters.status_id);
        }

        // Default to latest only, unless history is explicitly requested
        if (filters.all_attempts !== 'true') {
            conditions.push('s.is_latest = TRUE');
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        const countQuery = `SELECT COUNT(*) as total FROM (${query}) as sub`;
        const [countRows] = await db.query(countQuery, params);
        const total = countRows[0].total;

        // Explicit mapping to prevent SQL Injection
        const sortColumnMap = {
            submission_id: 's.submission_id',
            submitted_at: 's.submitted_at',
        };
        const sortColumn = sortColumnMap[sorting.sort_by] || 's.submitted_at';
        const sortOrder = sorting.order && sorting.order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const dataParams = [...params, Number(pagination.limit), Number(pagination.offset)];
        query += ` ORDER BY ${sortColumn} ${sortOrder} LIMIT ? OFFSET ?`;

        const [rows] = await db.query(query, dataParams);
        return { rows, total };
    }

    async findById(submissionId) {
        const [rows] = await db.execute(`SELECT * FROM submissions WHERE submission_id = ?`, [submissionId]);
        return rows[0];
    }

    async updateStatus(submissionId, statusId) {
        const [result] = await db.execute(`UPDATE submissions SET status_id = ? WHERE submission_id = ?`, [
            statusId,
            submissionId,
        ]);
        return result.affectedRows;
    }

    async getFilesBySubmissionId(submissionId) {
        const query = `
            SELECT f.file_id, f.original_file_name, f.mime_type, f.file_size_kb,
                   v.blob_name, v.container_name, v.version_number
            FROM documents d
            JOIN files f ON d.document_id = f.document_id
            JOIN file_versions v ON f.current_version_id = v.version_id
            WHERE d.submission_id = ? AND f.is_deleted = FALSE
        `;
        const [rows] = await db.execute(query, [submissionId]);
        return rows;
    }

    async getLatestAttempt(studentId, examScheduleId) {
        const [rows] = await db.execute(
            `SELECT MAX(attempt_number) as last_attempt FROM submissions WHERE student_id = ? AND exam_schedule_id = ?`,
            [studentId, examScheduleId],
        );
        return rows[0].last_attempt || 0;
    }

    async supersedePreviousSubmissions(studentId, examScheduleId) {
        await db.execute(
            `UPDATE submissions SET is_latest = FALSE WHERE student_id = ? AND exam_schedule_id = ? AND is_latest = TRUE`,
            [studentId, examScheduleId],
        );
    }
}

module.exports = new SubmissionsModel();
