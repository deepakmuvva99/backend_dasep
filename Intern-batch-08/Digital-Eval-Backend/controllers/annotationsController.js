const annotationsService = require('../services/annotationsService');
const { successResponse } = require('../utils/responseHandler');

exports.createAnnotation = async (req, res) => {
    const { evaluation_id, page_id, annotation_type_id, pos_x, pos_y, pos_width, pos_height, position_data, content } =
        req.body;
    if (!evaluation_id || !page_id || !annotation_type_id) {
        return res
            .status(400)
            .json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing required fields' } });
    }

    const annotation = await annotationsService.createAnnotation(
        {
            evaluation_id,
            page_id,
            annotation_type_id,
            pos_x,
            pos_y,
            pos_width,
            pos_height,
            position_data,
            content,
        },
        req.user,
    );
    return successResponse(res, annotation, 201);
};

exports.getAnnotations = async (req, res) => {
    const pageId = req.params.page_id;
    const annotations = await annotationsService.getAnnotationsForPage(pageId);
    return successResponse(res, annotations);
};

exports.getAnnotationsByEvaluation = async (req, res) => {
    const evalId = req.params.eval_id;
    const annotations = await annotationsService.getAnnotationsForEvaluation(evalId);
    return successResponse(res, annotations);
};

exports.getAnnotationsBySubmission = async (req, res) => {
    const submissionId = req.params.submission_id;
    const annotations = await annotationsService.getAnnotationsForSubmission(submissionId);
    return successResponse(res, annotations);
};

exports.getAnnotationDetails = async (req, res) => {
    const annotationId = req.params.annotation_id;
    const annotation = await annotationsService.getAnnotationDetails(annotationId);
    return successResponse(res, annotation);
};

exports.updateAnnotation = async (req, res) => {
    const annotationId = req.params.annotation_id;
    const updateData = req.body;

    const updated = await annotationsService.updateAnnotation(annotationId, updateData, req.user);
    return successResponse(res, updated);
};

exports.deleteAnnotation = async (req, res) => {
    await annotationsService.deleteAnnotation(req.params.annotation_id, req.user);
    return successResponse(res, { message: 'Annotation removed' });
};
