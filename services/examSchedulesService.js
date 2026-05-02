const examSchedulesModel = require('../models/examSchedulesModel');
const db = require('../config/database');
const notificationsService = require('./notificationsService');

class ExamSchedulesService {
    async createSchedule(data, createdByUserId) {
        // Validate if subject is in class (prevent scheduling physics for a class that only has humanities)
        const [validCombo] = await db.execute(
            `SELECT class_subject_id FROM CLASS_SUBJECTS WHERE class_id = ? AND subject_id = ?`,
            [data.class_id, data.subject_id]
        );
        
        if (validCombo.length === 0) {
            const error = new Error('Subject is not mapped to this Class');
            error.statusCode = 400;
            error.code = 'BAD_REQUEST';
            throw error;
        }

        const scheduleId = await examSchedulesModel.createSchedule(data, createdByUserId);

        // Notify Students
        const [students] = await db.execute(
            `SELECT user_id FROM STUDENTS WHERE class_id = ? AND is_active = 1 AND deleted_at IS NULL`,
            [data.class_id]
        );

        // Fetch subject and class names for notification
        const [subjectData] = await db.execute(`SELECT name FROM SUBJECTS WHERE subject_id = ?`, [data.subject_id]);
        const subjectName = subjectData[0]?.name || 'a Subject';

        for (const student of students) {
            await notificationsService.createNotification({
                user_id: student.user_id,
                title: 'New Exam Scheduled',
                message: `A new exam for ${subjectName} has been scheduled. Deadline: ${new Date(data.exam_datetime).toLocaleString()}`,
                type: 'exam_scheduled'
            });
        }

        // Notify Faculty
        const [assignments] = await db.execute(
            `SELECT f.user_id 
             FROM FACULTY_CLASS_SUBJECT_ASSIGNMENTS a
             JOIN FACULTY f ON a.faculty_id = f.faculty_id
             WHERE a.class_id = ? AND a.subject_id = ? AND f.is_active = 1 AND f.deleted_at IS NULL`,
            [data.class_id, data.subject_id]
        );

        for (const assignment of assignments) {
            await notificationsService.createNotification({
                user_id: assignment.user_id,
                title: 'New Exam Assignment',
                message: `An exam for ${subjectName} has been assigned to your class. You will be notified when the deadline hits to evaluate the submissions.`,
                type: 'exam_assigned'
            });
        }

        return { exam_schedule_id: scheduleId, ...data };
    }

    async getSchedules(query, pagination, sorting) {
        const filters = {
            class_id: query.class_id || null,
            subject_id: query.subject_id || null
        };
        return await examSchedulesModel.getSchedules(filters, pagination, sorting);
    }

    async getScheduleDetails(scheduleId) {
        const schedule = await examSchedulesModel.findById(scheduleId);
        if (!schedule) {
            const error = new Error('Exam schedule not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }
        return schedule;
    }

    async updateSchedule(scheduleId, data) {
        const existing = await examSchedulesModel.findById(scheduleId);
        if (!existing) {
            const error = new Error('Exam schedule not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }

        await examSchedulesModel.updateSchedule(scheduleId, data);
        return { exam_schedule_id: scheduleId, ...data };
    }

    async deleteSchedule(scheduleId) {
        const affectedRows = await examSchedulesModel.deleteSchedule(scheduleId);
        if (affectedRows === 0) {
            const error = new Error('Exam schedule not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }
        return true;
    }
}

module.exports = new ExamSchedulesService();
