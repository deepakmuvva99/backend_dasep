const annotationsModel = require('../models/annotationsModel');
const pagesService = require('./pagesService');
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
        
        const evaluationsModel = require('../models/evaluationsModel');
        const submissionsModel = require('../models/submissionsModel');

        // Auto-resolve submission_id if not provided
        if (!data.submission_id && data.evaluation_id) {
            const evaluation = await evaluationsModel.findById(data.evaluation_id);
            if (evaluation) {
                data.submission_id = evaluation.submission_id;
            }
        }

        // Auto-resolve evaluation_id if not provided
        if (!data.evaluation_id && data.submission_id) {
            const evaluation = await evaluationsModel.findBySubmissionId(data.submission_id);
            if (evaluation) {
                data.evaluation_id = evaluation.evaluation_id;
            } else {
                const error = new Error('An evaluation record must exist before adding annotations. Please save marks first.');
                error.statusCode = 400;
                error.code = 'BAD_REQUEST';
                throw error;
            }
        }

        // AUTO-RESOLVE page_id: If page_id is missing but page_number is provided
        if ((!data.page_id || data.page_id <= 0) && data.page_number && data.submission_id) {
            const files = await submissionsModel.getFilesBySubmissionId(data.submission_id);
            if (files && files.length > 0) {
                let targetVersionId = files[0].version_id;
                let targetPageNumber = parseInt(data.page_number, 10);

                // If multiple files exist, it's likely an image gallery where each image is treated as a "page"
                if (files.length > 1 && targetPageNumber > 0 && targetPageNumber <= files.length) {
                    targetVersionId = files[targetPageNumber - 1].version_id;
                    targetPageNumber = 1; // Each image file has its own page 1
                }

                const page = await pagesService.getOrCreatePage(targetVersionId, targetPageNumber);
                if (page) {
                    data.page_id = page.page_id;
                }
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
