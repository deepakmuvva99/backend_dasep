const annotationsModel = require('../models/annotationsModel');
const profileHelper = require('../utils/profileHelper');

class AnnotationsService {
    async createAnnotation(data, userContext) {
        if (userContext.role !== 'Faculty') {
            const error = new Error('Only faculty can create page annotations');
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
        data.created_by_faculty_id = facultyId;
        
        // Auto-resolve submission_id if not provided
        if (!data.submission_id && data.evaluation_id) {
            const evaluationsModel = require('../models/evaluationsModel');
            const evaluation = await evaluationsModel.findById(data.evaluation_id);
            if (evaluation) {
                data.submission_id = evaluation.submission_id;
            }
        }

        const annotationId = await annotationsModel.createAnnotation(data);
        return { annotation_id: annotationId, ...data };
    }

    async getAnnotationsForPage(pageId) {
        return await annotationsModel.getAnnotationsByPageId(pageId);
    }

    async getAnnotationsForEvaluation(evaluationId) {
        return await annotationsModel.getAnnotationsByEvaluationId(evaluationId);
    }

    async getAnnotationsForSubmission(submissionId) {
        return await annotationsModel.getAnnotationsBySubmissionId(submissionId);
    }

    async getAnnotationDetails(annotationId) {
        const annotation = await annotationsModel.findById(annotationId);
        if (!annotation) {
            const error = new Error('Annotation not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }
        return annotation;
    }

    async updateAnnotation(annotationId, annotationData, userContext) {
        const annotation = await this.getAnnotationDetails(annotationId);
        const currentFacultyId = await profileHelper.getProfileId(userContext.user_id, userContext.role);

        // Ownership Check (Security)
        if (userContext.role !== 'Admin' && annotation.created_by_faculty_id !== currentFacultyId) {
            const error = new Error('Cannot edit another users annotation');
            error.statusCode = 403;
            error.code = 'FORBIDDEN';
            throw error;
        }

        await annotationsModel.updateAnnotation(annotationId, annotationData);
        return { annotation_id: annotationId, ...annotationData };
    }

    async deleteAnnotation(annotationId, userContext) {
        const annotation = await this.getAnnotationDetails(annotationId);
        const currentFacultyId = await profileHelper.getProfileId(userContext.user_id, userContext.role);

        // Ownership Check (Security)
        if (userContext.role !== 'Admin' && annotation.created_by_faculty_id !== currentFacultyId) {
            const error = new Error('Cannot delete another users annotation');
            error.statusCode = 403;
            error.code = 'FORBIDDEN';
            throw error;
        }

        await annotationsModel.deleteAnnotation(annotationId);
        return true;
    }
}

module.exports = new AnnotationsService();
