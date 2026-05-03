const subjectsService = require('../services/subjectsService');
const { successResponse, successListResponse } = require('../utils/responseHandler');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');
const { parseSorting } = require('../utils/sorting');

exports.createSubject = async (req, res) => {
    const { name, code } = req.body;
    if (!name || !code) {
        return res
            .status(400)
            .json({ success: false, error: { code: 'BAD_REQUEST', message: 'name and code required' } });
    }

    const newSubject = await subjectsService.createSubject({ name, code }, req.user.user_id);
    return successResponse(res, newSubject, 201);
};

exports.getSubjects = async (req, res) => {
    const pagination = parsePagination(req.query);
    const sorting = parseSorting(req.query, ['name', 'code', 'subject_id'], 'name');

    // Pass user context for scoping (Faculty sees assigned, Admin sees all)
    // Assume user_id maps to faculty_id if the role is Faculty (true in this platform's extension tables)
    const userContext = req.user;

    const { rows, total } = await subjectsService.getSubjects(req.query, pagination, sorting, userContext);
    const meta = buildPaginationMeta(total, pagination.page, pagination.limit);

    return successListResponse(res, rows, meta);
};

exports.getSubjectDetails = async (req, res) => {
    const subjectId = req.params.subject_id;
    const userContext = req.user;

    const subject = await subjectsService.getSubjectDetails(subjectId, userContext);
    return successResponse(res, subject);
};

exports.updateSubject = async (req, res) => {
    const subjectId = req.params.subject_id;
    const { name, code } = req.body;

    const updatedSubject = await subjectsService.updateSubject(subjectId, { name, code }, req.user.user_id);
    return successResponse(res, updatedSubject);
};

exports.deleteSubject = async (req, res) => {
    const subjectId = req.params.subject_id;
    await subjectsService.deleteSubject(subjectId, req.user.user_id);
    return successResponse(res, { message: 'Subject deleted successfully' });
};

exports.getSubjectsLookup = async (req, res) => {
    const subjects = await subjectsService.getSubjectsLookup();
    return successResponse(res, subjects);
};
