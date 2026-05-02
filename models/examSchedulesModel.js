const db = require('../config/database');

class ExamSchedulesModel {
    async createSchedule(data, createdByUserId) {
        const [result] = await db.execute(
            `INSERT INTO EXAM_SCHEDULES (title, class_id, subject_id, exam_datetime, created_by_user_id, created_at)
             VALUES (?, ?, ?, ?, ?, NOW())`,
            [data.title, data.class_id, data.subject_id, data.exam_datetime, createdByUserId]
        );
        return result.insertId;
    }

    async getSchedules(filters, pagination, sorting) {
        let query = `
            SELECT es.exam_schedule_id, es.exam_schedule_id as id, es.title, es.exam_datetime, es.created_at,
                   c.grade, c.section, c.academic_year,
                   s.name as subject_name, s.code as subject_code
            FROM EXAM_SCHEDULES es
            JOIN CLASSES c ON es.class_id = c.class_id
            JOIN SUBJECTS s ON es.subject_id = s.subject_id
        `;
        const params = [];
        const conditions = [];

        if (filters.class_id) {
            conditions.push(`es.class_id = ?`);
            params.push(filters.class_id);
        }
        if (filters.subject_id) {
            conditions.push(`es.subject_id = ?`);
            params.push(filters.subject_id);
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        const countQuery = `SELECT COUNT(*) as total FROM (${query}) as sub`;
        const [countRows] = await db.execute(countQuery, params);
        const total = countRows[0].total;

        let sortAlias = `es.exam_datetime`; // default
        if (sorting.sort_by === 'title') sortAlias = `es.title`;
        if (sorting.sort_by === 'created_at') sortAlias = `es.created_at`;

        query += ` ORDER BY ${sortAlias} ${sorting.order} LIMIT ? OFFSET ?`;
        params.push(pagination.limit, pagination.offset);

        const [rows] = await db.query(query, params);
        return { rows, total };
    }

    async findById(scheduleId) {
        const [rows] = await db.execute(
            `SELECT es.*, es.exam_schedule_id as id, c.grade, c.section, s.name as subject_name
             FROM EXAM_SCHEDULES es
             JOIN CLASSES c ON es.class_id = c.class_id
             JOIN SUBJECTS s ON es.subject_id = s.subject_id
             WHERE es.exam_schedule_id = ?`,
            [scheduleId]
        );
        return rows[0];
    }

    async updateSchedule(scheduleId, data) {
        const [result] = await db.execute(
            `UPDATE EXAM_SCHEDULES SET title = ?, exam_datetime = ? WHERE exam_schedule_id = ?`,
            [data.title, data.exam_datetime, scheduleId]
        );
        return result.affectedRows;
    }

    async deleteSchedule(scheduleId) {
        const [result] = await db.execute(
            `DELETE FROM EXAM_SCHEDULES WHERE exam_schedule_id = ?`,
            [scheduleId]
        );
        return result.affectedRows;
    }
}

module.exports = new ExamSchedulesModel();
