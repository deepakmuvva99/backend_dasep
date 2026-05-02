const evaluationsService = require('../services/evaluationsService');
const { successResponse, successListResponse } = require('../utils/responseHandler');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');
const { parseSorting } = require('../utils/sorting');

exports.createEvaluation = async (req, res) => {
    const { submission_id, marks_awarded, max_marks, remarks, status_id } = req.body;
    
    if (!submission_id || marks_awarded === undefined || !max_marks || !status_id) {
        return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing required evaluation fields' }});
    }

    const userContext = req.user; 

    const newEvaluation = await evaluationsService.createEvaluation(
        { submission_id, marks_awarded, max_marks, remarks, status_id }, 
        userContext
    );

    return successResponse(res, newEvaluation, 201);
};

exports.getEvaluations = async (req, res) => {
    const pagination = parsePagination(req.query);
    const sorting = parseSorting(req.query, ['evaluated_at', 'marks_awarded'], 'evaluated_at');
    const userContext = req.user;

    const { rows, total } = await evaluationsService.getEvaluations(req.query, pagination, sorting, userContext);
    const meta = buildPaginationMeta(total, pagination.page, pagination.limit);

    return successListResponse(res, rows, meta);
};

exports.getEvaluationDetails = async (req, res) => {
    const userContext = req.user;
    const details = await evaluationsService.getEvaluationDetails(req.params.evaluation_id, userContext);
    return successResponse(res, details);
};

exports.updateEvaluation = async (req, res) => {
    const { marks_awarded, max_marks, remarks, status_id } = req.body;
    const updated = await evaluationsService.updateEvaluation(req.params.evaluation_id, {
        marks_awarded, max_marks, remarks, status_id
    });
    return successResponse(res, updated);
};

exports.getEvaluationStatuses = async (req, res) => {
    const statuses = await evaluationsService.getEvaluationStatuses();
    return successResponse(res, statuses);
};

exports.getEvaluationBySubmission = async (req, res) => {
    const evaluation = await evaluationsService.getEvaluationBySubmission(req.params.submission_id);
    return successResponse(res, evaluation);
};

exports.getEvaluationsByFaculty = async (req, res) => {
    const pagination = parsePagination(req.query);
    const { rows, total } = await evaluationsService.getEvaluationsByFaculty(req.params.faculty_id, pagination, req.query);
    const meta = buildPaginationMeta(total, pagination.page, pagination.limit);
    return successListResponse(res, rows, meta);
};
