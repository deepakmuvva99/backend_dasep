const examSchedulesModel = require('../models/examSchedulesModel');
const typeOfExamModel = require('../models/typeOfExamModel');
const db = require('../config/database');
const notificationsService = require('./notificationsService');
const auditLogsService = require('./auditLogsService');
const profileHelper = require('../utils/profileHelper');

class ExamSchedulesService {
    async createSchedule(data, createdByUserId) {
        // Validate if subject is in class (prevent scheduling physics for a class that only has humanities)
        const [validCombo] = await db.execute(
            `SELECT class_subject_id FROM class_subjects WHERE class_id = ? AND subject_id = ?`,
            [data.class_id, data.subject_id],
        );

        if (validCombo.length === 0) {
            const error = new Error('Subject is not mapped to this Class');
            error.statusCode = 400;
            error.code = 'BAD_REQUEST';
            throw error;
        }

        const scheduleId = await examSchedulesModel.createSchedule(data, createdByUserId);

        await auditLogsService.logAction({
            entity_type: 'exam_schedules',
            entity_id: scheduleId,
            field_name: 'all',
            old_value: null,
            new_value: JSON.stringify({
                title: data.title,
                class_id: data.class_id,
                subject_id: data.subject_id,
                exam_type: data.exam_type,
                exam_datetime: data.exam_datetime,
            }),
            changed_by_user_id: createdByUserId,
        });

        // Notify Students
        const [students] = await db.execute(
            `SELECT user_id FROM students WHERE class_id = ? AND is_active = 1 AND deleted_at IS NULL`,
            [data.class_id],
        );

        // Fetch subject and class names for notification
        const [subjectData] = await db.execute(`SELECT name FROM subjects WHERE subject_id = ?`, [data.subject_id]);
        const subjectName = subjectData[0]?.name || 'a Subject';

        for (const student of students) {
            await notificationsService.createNotification({
                user_id: student.user_id,
                entity_type: 'exam_schedules',
                entity_id: scheduleId,
                message: `A new exam for ${subjectName} has been scheduled. Deadline: ${new Date(data.exam_datetime).toLocaleString()}`,
            });
        }

        // Notify Faculty
        const [assignments] = await db.execute(
            `SELECT f.user_id 
             FROM faculty_class_subject_assignments a
             JOIN faculty f ON a.faculty_id = f.faculty_id
             WHERE a.class_id = ? AND a.subject_id = ? AND f.is_active = 1 AND f.deleted_at IS NULL`,
            [data.class_id, data.subject_id],
        );

        for (const assignment of assignments) {
            await notificationsService.createNotification({
                user_id: assignment.user_id,
                entity_type: 'exam_schedules',
                entity_id: scheduleId,
                message: `An exam for ${subjectName} has been assigned to your class. You will be notified when the deadline hits to evaluate the submissions.`,
            });
        }

        return { exam_schedule_id: scheduleId, ...data };
    }

    async getSchedules(query, pagination, sorting, userContext) {
        const filters = {
            class_id: query.class_id || null,
            subject_id: query.subject_id || null,
        };

        // Scoping for Students: Automatically filter by their class
        if (userContext && userContext.role === 'Student') {
            const classId = await profileHelper.getStudentClassId(userContext.user_id);
            filters.class_id = classId;
        }

        return await examSchedulesModel.getSchedules(filters, pagination, sorting, userContext);
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

    async getExamTypes(userContext) {
        const allTypes = await typeOfExamModel.getAll();

        // RBAC: Faculty cannot see 'Quiz' (ID: 4)
        if (userContext && userContext.role === 'Faculty') {
            return allTypes.filter((type) => type.name.toLowerCase() !== 'quiz');
        }

        return allTypes;
    }

    async updateSchedule(scheduleId, data, actorId) {
        const existing = await examSchedulesModel.findById(scheduleId);
        if (!existing) {
            const error = new Error('Exam schedule not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }

        await examSchedulesModel.updateSchedule(scheduleId, data);

        await auditLogsService.logAction({
            entity_type: 'exam_schedules',
            entity_id: scheduleId,
            field_name: 'all',
            old_value: JSON.stringify({ title: existing.title, exam_type: existing.exam_type, exam_datetime: existing.exam_datetime }),
            new_value: JSON.stringify({ title: data.title, exam_type: data.exam_type, exam_datetime: data.exam_datetime }),
            changed_by_user_id: actorId,
        });

        return { exam_schedule_id: scheduleId, ...data };
    }

    async deleteSchedule(scheduleId, actorId) {
        const existing = await examSchedulesModel.findById(scheduleId);
        const affectedRows = await examSchedulesModel.deleteSchedule(scheduleId);
        if (affectedRows === 0) {
            const error = new Error('Exam schedule not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }

        await auditLogsService.logAction({
            entity_type: 'exam_schedules',
            entity_id: scheduleId,
            field_name: 'all',
            old_value: JSON.stringify(existing),
            new_value: 'DELETED',
            changed_by_user_id: actorId,
        });

        return true;
    }
}

module.exports = new ExamSchedulesService();
