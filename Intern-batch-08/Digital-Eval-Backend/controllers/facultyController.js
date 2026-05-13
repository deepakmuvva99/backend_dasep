const facultyService = require('../services/facultyService');
const { successResponse, successListResponse } = require('../utils/responseHandler');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

exports.createFaculty = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email) {
        return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing fields (name and email required)' } });
    }

    const newFaculty = await facultyService.createFaculty({ name, email, password });
    return successResponse(res, newFaculty, 201);
};

exports.getFacultyList = async (req, res) => {
    const pagination = parsePagination(req.query);
    const { rows, total } = await facultyService.getFaculty(req.query, pagination);
    const meta = buildPaginationMeta(total, pagination.page, pagination.limit);

    return successListResponse(res, rows, meta);
};

exports.getFacultyProfile = async (req, res) => {
    let facultyId = req.params.faculty_id;
    if (facultyId === 'me') facultyId = req.user.profile_id;
    
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
    // Postman sends profile data to this endpoint. We look for is_active, 
    // or default to true if it's a "set status" call without explicit false.
    const isActive = req.body.is_active !== undefined ? req.body.is_active : true;

    await facultyService.setFacultyStatus(facultyId, isActive);
    return successResponse(res, { message: 'Status updated' });
};

exports.getFacultyAssignments = async (req, res) => {
    let facultyId = req.params.faculty_id;
    if (facultyId === 'me') facultyId = req.user.profile_id;

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
