const assignmentsService = require('../services/assignmentsService');
const { successResponse, successListResponse } = require('../utils/responseHandler');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');
const { parseSorting } = require('../utils/sorting');

exports.createAssignment = async (req, res) => {
    const { faculty_id, subject_id, class_id } = req.body;
    if (!faculty_id || !subject_id || !class_id) {
        return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing fields' }});
    }

    const assignment = await assignmentsService.createAssignment({ faculty_id, subject_id, class_id });
    return successResponse(res, assignment, 201);
};

exports.getAssignments = async (req, res) => {
    const pagination = parsePagination(req.query);
    const sorting = parseSorting(req.query, ['assigned_at', 'faculty_name', 'subject_name'], 'assigned_at');

    const { rows, total } = await assignmentsService.getAssignments(req.query, pagination, sorting);
    const meta = buildPaginationMeta(total, pagination.page, pagination.limit);

    return successListResponse(res, rows, meta);
};

exports.getAssignmentDetails = async (req, res) => {
    const assignmentId = req.params.assignment_id;
    const details = await assignmentsService.getAssignmentDetails(assignmentId);
    return successResponse(res, details);
};

exports.updateAssignment = async (req, res) => {
    const assignmentId = req.params.assignment_id;
    const data = {
        faculty_id: req.body.faculty_id,
        subject_id: req.body.subject_id,
        class_id: req.body.class_id
    };

    const updated = await assignmentsService.updateAssignment(assignmentId, data);
    return successResponse(res, updated);
};

exports.deleteAssignment = async (req, res) => {
    await assignmentsService.deleteAssignment(req.params.assignment_id);
    return successResponse(res, { message: 'Assignment dynamically removed' });
};
