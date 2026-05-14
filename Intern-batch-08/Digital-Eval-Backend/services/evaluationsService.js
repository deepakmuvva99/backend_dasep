const evaluationsModel = require('../models/evaluationsModel');
const profileHelper = require('../utils/profileHelper');
const auditLogsService = require('./auditLogsService');
const submissionsService = require('./submissionsService');

class EvaluationsService {
    async createEvaluation(data, userContext) {
        // Enforce constraints
        if (data.marks_awarded > data.max_marks) {
            const error = new Error('marks_awarded cannot exceed max_marks');
            error.statusCode = 400;
            error.code = 'BAD_REQUEST';
            throw error;
        }

        // Map JWT user_id to faculty_id
        if (userContext.role !== 'Faculty') {
            const error = new Error('Only faculty can evaluate submissions');
            error.statusCode = 403;
            error.code = 'FORBIDDEN';
            throw error;
        }

        const facultyId = await profileHelper.getProfileId(userContext.user_id, userContext.role);
        if (!facultyId) {
            const error = new Error('Faculty profile not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }

        data.faculty_id = facultyId;

        const result = await evaluationsModel.createEvaluation(data);
        if (result.error === 'EVALUATION_EXISTS') {
            const error = new Error('An evaluation already exists for this submission');
            error.statusCode = 409;
            error.code = 'CONFLICT';
            throw error;
        }

        await auditLogsService.logAction(
            {
                entity_type: 'evaluations',
                entity_id: result.evaluation_id,
                field_name: 'all',
                old_value: null,
                new_value: JSON.stringify(data),
            },
            userContext,
        );

        return { evaluation_id: result.evaluation_id, ...data };
    }

    async getEvaluations(query, pagination, sorting, userContext) {
        const filters = {
            status_id: query.status_id || null,
        };
        return await evaluationsModel.getEvaluations(filters, pagination, sorting, userContext);
    }

    async getEvaluationDetails(evaluationId, userContext) {
        const evaluation = await evaluationsModel.findById(evaluationId);
        if (!evaluation) {
            const error = new Error('Evaluation not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }

        // Security: IDOR Check
        if (userContext.role === 'Student') {
            const studentId = await profileHelper.getProfileId(userContext.user_id, userContext.role);
            if (evaluation.student_id !== studentId) {
                const error = new Error('Access denied: You can only view your own evaluations');
                error.statusCode = 403;
                error.code = 'FORBIDDEN';
                throw error;
            }
        }

        // Fetch submission details (which now includes files with SAS URLs)
        const submission = await submissionsService.getSubmissionDetails(evaluation.submission_id, { role: 'Admin' });
        evaluation.submission = submission;

        return evaluation;
    }

    async updateEvaluation(evaluationId, data, actorId) {
        const existing = await this.getEvaluationDetails(evaluationId, { role: 'Admin' });

        if (data.marks_awarded > data.max_marks) {
            const error = new Error('marks_awarded cannot exceed max_marks');
            error.statusCode = 400;
            error.code = 'BAD_REQUEST';
            throw error;
        }

        await evaluationsModel.updateEvaluation(evaluationId, data);

        await auditLogsService.logAction({
            entity_type: 'evaluations',
            entity_id: evaluationId,
            field_name: 'all',
            old_value: JSON.stringify({ marks_awarded: existing.marks_awarded, status_id: existing.status_id }),
            new_value: JSON.stringify({ marks_awarded: data.marks_awarded, status_id: data.status_id }),
            changed_by_user_id: actorId,
        });

        return { evaluation_id: evaluationId, ...existing, ...data };
    }

    async getEvaluationStatuses() {
        return await evaluationsModel.getStatuses();
    }

    async getEvaluationBySubmission(submissionId) {
        const evaluation = await evaluationsModel.findBySubmissionId(submissionId);
        if (!evaluation) {
            const error = new Error('Evaluation not found for this submission');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }

        // Fetch submission details (which now includes files with SAS URLs)
        const submission = await submissionsService.getSubmissionDetails(submissionId, { role: 'Admin' });
        evaluation.submission = submission;

        return evaluation;
    }

    async getEvaluationsByFaculty(facultyId, pagination, query) {
        const filters = { status: query.status };
        return await evaluationsModel.findByFacultyId(facultyId, pagination, filters);
    }
}

module.exports = new EvaluationsService();
