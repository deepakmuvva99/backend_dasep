const db = require('../config/database');

class ExamSchedulesModel {
    async createSchedule(data, createdByUserId) {
        const [result] = await db.execute(
            `INSERT INTO exam_schedules (title, class_id, subject_id, exam_datetime, created_by_user_id, created_at)
             VALUES (?, ?, ?, ?, ?, NOW())`,
            [data.title, data.class_id, data.subject_id, data.exam_datetime, createdByUserId],
        );
        return result.insertId;
    }

    async getSchedules(filters, pagination, sorting, userContext) {
        let query = `
            SELECT es.exam_schedule_id, es.exam_schedule_id as id, es.title, es.exam_datetime, es.created_at,
                   c.grade, c.section, c.academic_year,
                   s.name as subject_name, s.code as subject_code
            FROM exam_schedules es
            JOIN classes c ON es.class_id = c.class_id
            JOIN subjects s ON es.subject_id = s.subject_id
        `;
        const params = [];
        const conditions = [];

        // Scoping for Faculty: Only show exams for classes/subjects they are assigned to
        if (userContext && userContext.role === 'Faculty') {
            query += ` JOIN faculty_class_subject_assignments a ON (es.class_id = a.class_id AND es.subject_id = a.subject_id) `;
            conditions.push(`a.faculty_id = ?`);
            params.push(userContext.profile_id);
        }

        if (filters.class_id) {
            conditions.push(`es.class_id = ?`);
            params.push(filters.class_id);
        }
        if (filters.subject_id) {
            conditions.push(`es.subject_id = ?`);
            params.push(filters.subject_id);
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ') + ` AND es.deleted_at IS NULL`;
        } else {
            query += ` WHERE es.deleted_at IS NULL`;
        }

        const countQuery = `SELECT COUNT(*) as total FROM (${query}) as sub`;
        const [countRows] = await db.execute(countQuery, params);
        const total = countRows[0].total;

        // Explicit mapping to prevent SQL Injection
        const sortColumnMap = {
            exam_datetime: 'es.exam_datetime',
            title: 'es.title',
            created_at: 'es.created_at',
        };
        const sortColumn = sortColumnMap[sorting.sort_by] || 'es.exam_datetime';
        const sortOrder = sorting.order && sorting.order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        query += ` ORDER BY ${sortColumn} ${sortOrder} LIMIT ? OFFSET ?`;
        params.push(pagination.limit, pagination.offset);

        const [rows] = await db.query(query, params);
        return { rows, total };
    }

    async findById(scheduleId) {
        const [rows] = await db.execute(
            `SELECT es.*, es.exam_schedule_id as id, c.grade, c.section, s.name as subject_name
             FROM exam_schedules es
             JOIN classes c ON es.class_id = c.class_id
             JOIN subjects s ON es.subject_id = s.subject_id
             WHERE es.exam_schedule_id = ? AND es.deleted_at IS NULL`,
            [scheduleId],
        );
        return rows[0];
    }

    async updateSchedule(scheduleId, data) {
        const [result] = await db.execute(
            `UPDATE exam_schedules SET title = ?, exam_datetime = ? WHERE exam_schedule_id = ?`,
            [data.title, data.exam_datetime, scheduleId],
        );
        return result.affectedRows;
    }

    async deleteSchedule(scheduleId) {
        const [result] = await db.execute(`UPDATE exam_schedules SET deleted_at = NOW() WHERE exam_schedule_id = ?`, [scheduleId]);
        return result.affectedRows;
    }
}

module.exports = new ExamSchedulesModel();
