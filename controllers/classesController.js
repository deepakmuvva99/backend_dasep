const classesService = require('../services/classesService');
const { successResponse, successListResponse } = require('../utils/responseHandler');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');
const { parseSorting } = require('../utils/sorting');

exports.createClass = async (req, res) => {
    const { grade, section, academic_year } = req.body;
    if (!grade || !section || !academic_year) {
        return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing fields' }});
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
