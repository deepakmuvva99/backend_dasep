const submissionsModel = require('../models/submissionsModel');
const profileHelper = require('../utils/profileHelper');

class SubmissionsService {
    async createSubmission(data, userContext) {
        if (userContext.role !== 'Student') {
            const error = new Error('Only students can create submissions');
            error.statusCode = 403;
            error.code = 'FORBIDDEN';
            throw error;
        }

        // Map user_id to student_id
        const studentId = await profileHelper.getProfileId(userContext.user_id, userContext.role);
        if (!studentId) {
            const error = new Error('Student profile not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }

        data.student_id = studentId;
        // Default to Pending status (assuming ID 1 = Pending)
        data.status_id = 1; 

        // Additional validation: verify if the assignment_id actually exists
        const submissionId = await submissionsModel.createSubmission(data);
        return { submission_id: submissionId, status: 'Pending' };
    }

    async getSubmissions(query, pagination, sorting, userContext) {
        const filters = {
            status_id: query.status_id || null
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

    async updateStatus(submissionId, statusId) {
        const affectedRows = await submissionsModel.updateStatus(submissionId, statusId);
        if (affectedRows === 0) {
            const error = new Error('Submission not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }
        return true;
    }
}

module.exports = new SubmissionsService();
