const submissionsService = require('../services/submissionsService');
const { successResponse, successListResponse } = require('../utils/responseHandler');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');
const { parseSorting } = require('../utils/sorting');

exports.createSubmission = async (req, res) => {
    const userContext = req.user;
    const data = {
        assignment_id: req.body.assignment_id,
        exam_schedule_id: req.body.exam_schedule_id,
        submission_type_id: req.body.submission_type_id,
    };

    if (!data.assignment_id || !data.submission_type_id) {
        return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing parameters' } });
    }

    const newSub = await submissionsService.createSubmission(data, userContext);
    return successResponse(res, newSub, 201);
};

exports.getSubmissions = async (req, res) => {
    const pagination = parsePagination(req.query);
    const sorting = parseSorting(req.query, ['submitted_at', 'attempt_number'], 'submitted_at');
    const userContext = req.user;

    const { rows, total } = await submissionsService.getSubmissions(req.query, pagination, sorting, userContext);
    const meta = buildPaginationMeta(total, pagination.page, pagination.limit);

    return successListResponse(res, rows, meta);
};

exports.getSubmissionDetails = async (req, res) => {
    const submissionId = req.params.submission_id;
    const userContext = req.user;

    const details = await submissionsService.getSubmissionDetails(submissionId, userContext);
    return successResponse(res, details);
};

exports.updateSubmissionStatus = async (req, res) => {
    const submissionId = req.params.submission_id;
    const { status_id } = req.body;
    const actorId = req.user.user_id;

    await submissionsService.updateStatus(submissionId, status_id, actorId);
    return successResponse(res, { message: 'Submission status updated successfully' });
};
