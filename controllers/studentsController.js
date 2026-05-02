const studentsService = require('../services/studentsService');
const { successResponse, successListResponse } = require('../utils/responseHandler');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');
const { parseSorting } = require('../utils/sorting');

exports.createStudent = async (req, res) => {
    // Admin user id should be parsed from JWT user obj
    const adminUserId = req.user.user_id; 

    // Body: { name, email, institution_id, class_id }
    if (!req.body.name || !req.body.email || !req.body.institution_id || !req.body.class_id) {
        return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing required parameters' }});
    }

    const result = await studentsService.createStudent(req.body, adminUserId);
    return successResponse(res, result, 201);
};

exports.getStudents = async (req, res) => {
    const pagination = parsePagination(req.query);
    const sorting = parseSorting(req.query, ['name', 'institution_id', 'class_id', 'created_at'], 'created_at');

    const { rows, total } = await studentsService.getStudents(req.query, pagination, sorting);
    const meta = buildPaginationMeta(total, pagination.page, pagination.limit);

    return successListResponse(res, rows, meta);
};

exports.getStudentProfile = async (req, res) => {
    const studentId = req.params.student_id;
    const userContext = req.user;

    const student = await studentsService.getStudentProfile(studentId, userContext);
    return successResponse(res, student);
};

exports.updateStudent = async (req, res) => {
    const studentId = req.params.student_id;
    const { class_id, institution_id } = req.body;

    const updatedStudent = await studentsService.updateStudent(studentId, { class_id, institution_id });
    return successResponse(res, updatedStudent);
};

exports.deleteStudent = async (req, res) => {
    const studentId = req.params.student_id;
    await studentsService.deleteStudent(studentId);
    return successResponse(res, { message: 'Student soft-deleted successfully' });
};

exports.updateStudentStatus = async (req, res) => {
    const studentId = req.params.student_id;
    const { is_active } = req.body;
    
    await studentsService.setStudentStatus(studentId, is_active);
    return successResponse(res, { message: 'Status updated successfully' });
};

exports.getStudentSubmissions = async (req, res) => {
    const studentId = req.params.student_id;
    const pagination = parsePagination(req.query);
    const userContext = req.user;

    const { rows, total } = await studentsService.getStudentSubmissions(studentId, pagination, userContext);
    const meta = buildPaginationMeta(total, pagination.page, pagination.limit);

    return successListResponse(res, rows, meta);
};
