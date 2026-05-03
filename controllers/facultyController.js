const facultyService = require('../services/facultyService');
const { successResponse, successListResponse } = require('../utils/responseHandler');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

exports.createFaculty = async (req, res) => {
    const { name, email, subject_name } = req.body;
    if (!name || !email || !subject_name) {
        return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing fields' } });
    }

    const newFaculty = await facultyService.createFaculty({ name, email, subject_name });
    return successResponse(res, newFaculty, 201);
};

exports.getFacultyList = async (req, res) => {
    const pagination = parsePagination(req.query);
    const { rows, total } = await facultyService.getFaculty(req.query, pagination);
    const meta = buildPaginationMeta(total, pagination.page, pagination.limit);

    return successListResponse(res, rows, meta);
};

exports.getFacultyProfile = async (req, res) => {
    const facultyId = req.params.faculty_id;
    const userContext = req.user;

    const profile = await facultyService.getFacultyProfile(facultyId, userContext);
    return successResponse(res, profile);
};

exports.updateFaculty = async (req, res) => {
    const facultyId = req.params.faculty_id;
    const updated = await facultyService.updateFaculty(facultyId, req.body);
    return successResponse(res, updated);
};

exports.deleteFaculty = async (req, res) => {
    await facultyService.deleteFaculty(req.params.faculty_id);
    return successResponse(res, { message: 'Faculty softly deleted' });
};

exports.updateFacultyStatus = async (req, res) => {
    const facultyId = req.params.faculty_id;
    await facultyService.setFacultyStatus(facultyId, req.body.is_active);
    return successResponse(res, { message: 'Status updated' });
};

exports.getFacultyAssignments = async (req, res) => {
    const facultyId = req.params.faculty_id;
    const userContext = req.user;
    const pagination = parsePagination(req.query);

    const { rows, total } = await facultyService.getFacultyAssignments(facultyId, pagination, userContext);
    const meta = buildPaginationMeta(total, pagination.page, pagination.limit);

    return successListResponse(res, rows, meta);
};

exports.getSubjectNamesLookup = async (req, res) => {
    const subjectNames = await facultyService.getSubjectNamesLookup();
    return successResponse(res, subjectNames);
};

exports.getFacultyLookup = async (req, res) => {
    const faculty = await facultyService.getFacultyLookup();
    return successResponse(res, faculty);
};
