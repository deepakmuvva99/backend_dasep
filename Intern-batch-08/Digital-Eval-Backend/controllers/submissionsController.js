const submissionsService = require('../services/submissionsService');
const { successResponse, successListResponse } = require('../utils/responseHandler');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');
const { parseSorting } = require('../utils/sorting');
const { generateSASUrl } = require('../utils/azureStorage');

exports.createSubmission = async (req, res) => {
    const userContext = req.user;
    const data = {
        assignment_id: req.body.assignment_id,
        exam_schedule_id: req.body.exam_schedule_id,
        submission_type_id: req.body.submission_type_id,
        student_id: req.body.student_id, // Postman sends student_id
    };

    // Either assignment_id or exam_schedule_id should be present
    if ((!data.assignment_id && !data.exam_schedule_id) || !data.submission_type_id) {
        return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing parameters (assignment_id/exam_schedule_id and submission_type_id required)' } });
    }

    const newSub = await submissionsService.createSubmission(data, userContext);

    // If filename is provided, generate a secure upload URL
    if (req.body.filename) {
        const blobName = `submissions/${newSub.submission_id}/${req.body.filename}`;
        newSub.upload_url = await generateSASUrl('dasep-container', blobName, 'w');
        newSub.blob_name = blobName;
    }

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
