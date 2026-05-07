const classesService = require('../services/classesService');
const { successResponse, successListResponse } = require('../utils/responseHandler');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');
const { parseSorting } = require('../utils/sorting');

exports.createClass = async (req, res) => {
    const { grade, section, academic_year } = req.body;
    if (!grade || !section || !academic_year) {
        return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing fields' } });
    }

    const newClass = await classesService.createClass({ grade, section, academic_year });
    return successResponse(res, newClass, 201);
};

exports.getClasses = async (req, res) => {
    const pagination = parsePagination(req.query);
    const sorting = parseSorting(req.query, ['grade', 'academic_year', 'created_at'], 'grade');

    const { rows, total } = await classesService.getClasses(req.query, pagination, sorting);
    const meta = buildPaginationMeta(total, pagination.page, pagination.limit);

    return successListResponse(res, rows, meta);
};

exports.getClassDetails = async (req, res) => {
    const c = await classesService.getClassDetails(req.params.class_id);
    return successResponse(res, c);
};

exports.updateClass = async (req, res) => {
    const { grade, section, academic_year } = req.body;
    const updated = await classesService.updateClass(req.params.class_id, { grade, section, academic_year });
    return successResponse(res, updated);
};

exports.deleteClass = async (req, res) => {
    await classesService.deleteClass(req.params.class_id);
    return successResponse(res, { message: 'Class deleted successfully' });
};

exports.getClassSubjects = async (req, res) => {
    const pagination = parsePagination(req.query);
    const { rows, total } = await classesService.getClassSubjects(req.params.class_id, pagination);
    const meta = buildPaginationMeta(total, pagination.page, pagination.limit);

    return successListResponse(res, rows, meta);
};

exports.getClassesLookup = async (req, res) => {
    const classes = await classesService.getClassesLookup();
    return successResponse(res, classes);
};

exports.linkSubject = async (req, res) => {
    const classId = req.params.class_id;
    const { subject_id, subject_ids } = req.body;

    const idsToLink = subject_ids || (subject_id ? [subject_id] : []);

    if (idsToLink.length === 0) {
        return res.status(400).json({
            success: false,
            error: { code: 'BAD_REQUEST', message: 'Missing subject_id or subject_ids array' },
        });
    }

    // Call service for each ID (or update service to handle array)
    for (const sid of idsToLink) {
        await classesService.addClassSubject(classId, sid);
    }

    return successResponse(res, { message: 'Subject(s) linked to class successfully' }, 201);
};

exports.unlinkSubject = async (req, res) => {
    const classId = req.params.class_id;
    const subjectId = req.params.subject_id;

    await classesService.removeClassSubject(classId, subjectId);
    return successResponse(res, { message: 'Subject unlinked from class successfully' });
};

exports.getClassStudents = async (req, res) => {
    const classId = req.params.class_id;
    const pagination = parsePagination(req.query);
    const userContext = req.user;

    const { rows, total } = await classesService.getClassStudents(classId, pagination, userContext);
    const meta = buildPaginationMeta(total, pagination.page, pagination.limit);

    return successListResponse(res, rows, meta);
};
