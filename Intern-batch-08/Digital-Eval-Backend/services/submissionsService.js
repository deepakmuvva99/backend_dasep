const submissionsModel = require('../models/submissionsModel');
const profileHelper = require('../utils/profileHelper');
const auditLogsService = require('./auditLogsService');

class SubmissionsService {
    async createSubmission(data, userContext) {
        // If student_id is provided in body, only Admin can set it
        if (data.student_id && userContext.role !== 'Admin') {
            const error = new Error('Only admins can specify a different student_id');
            error.statusCode = 403;
            error.code = 'FORBIDDEN';
            throw error;
        }

        // Map user_id to student_id if not provided
        if (!data.student_id) {
            if (userContext.role !== 'Student') {
                const error = new Error('Only students can create their own submissions');
                error.statusCode = 403;
                error.code = 'FORBIDDEN';
                throw error;
            }
            const studentId = await profileHelper.getProfileId(userContext.user_id, userContext.role);
            if (!studentId) {
                const error = new Error('Student profile not found');
                error.statusCode = 404;
                error.code = 'NOT_FOUND';
                throw error;
            }
            data.student_id = studentId;
        }

        // Default to Pending status (assuming ID 1 = Pending)
        data.status_id = data.status_id || 1;

        const submissionId = await submissionsModel.createSubmission(data);

        await auditLogsService.logAction({
            entity_type: 'submissions',
            entity_id: submissionId,
            field_name: 'all',
            old_value: null,
            new_value: JSON.stringify({
                student_id: data.student_id,
                exam_schedule_id: data.exam_schedule_id,
                status_id: data.status_id,
            }),
            changed_by_user_id: userContext.user_id,
        });

        return { submission_id: submissionId, status: 'Pending' };
    }

    async getSubmissions(query, pagination, sorting, userContext) {
        const filters = {
            status_id: query.status_id || null,
        };

        return await submissionsModel.getSubmissions(filters, pagination, sorting, userContext);
    }

    async getSubmissionDetails(submissionId, userContext) {
        const sub = await submissionsModel.findById(submissionId);
        if (!sub) {
            const error = new Error('Submission not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }

        // Security: IDOR Check
        if (userContext.role === 'Student') {
            const studentId = await profileHelper.getProfileId(userContext.user_id, userContext.role);
            if (sub.student_id !== studentId) {
                const error = new Error('Access denied: You can only view your own submissions');
                error.statusCode = 403;
                error.code = 'FORBIDDEN';
                throw error;
            }
        }
        return sub;
    }

    async updateStatus(submissionId, statusId, actorId) {
        const oldSub = await submissionsModel.findById(submissionId);
        if (!oldSub) {
            const error = new Error('Submission not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }

        await submissionsModel.updateStatus(submissionId, statusId);

        await auditLogsService.logAction({
            entity_type: 'submissions',
            entity_id: submissionId,
            field_name: 'status_id',
            old_value: String(oldSub.status_id),
            new_value: String(statusId),
            changed_by_user_id: actorId,
        });

        return true;
    }
}

module.exports = new SubmissionsService();
