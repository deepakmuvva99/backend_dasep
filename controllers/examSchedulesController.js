const examSchedulesService = require('../services/examSchedulesService');
const { successResponse, successListResponse } = require('../utils/responseHandler');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');
const { parseSorting } = require('../utils/sorting');

exports.createSchedule = async (req, res) => {
    const { title, class_id, subject_id, exam_datetime } = req.body;
    if (!title || !class_id || !subject_id || !exam_datetime) {
        return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing fields' } });
    }

    const createdByUserId = req.user.user_id;

    const newSchedule = await examSchedulesService.createSchedule(
        { title, class_id, subject_id, exam_datetime },
        createdByUserId,
    );
    return successResponse(res, newSchedule, 201);
};

exports.getSchedules = async (req, res) => {
    const pagination = parsePagination(req.query);
    const sorting = parseSorting(req.query, ['exam_datetime', 'title', 'created_at'], 'exam_datetime');

    const { rows, total } = await examSchedulesService.getSchedules(req.query, pagination, sorting);
    const meta = buildPaginationMeta(total, pagination.page, pagination.limit);

    return successListResponse(res, rows, meta);
};

exports.getScheduleDetails = async (req, res) => {
    const schedule = await examSchedulesService.getScheduleDetails(req.params.schedule_id);
    return successResponse(res, schedule);
};

exports.updateSchedule = async (req, res) => {
    const { title, exam_datetime } = req.body;
    const actorId = req.user.user_id;
    const updated = await examSchedulesService.updateSchedule(
        req.params.schedule_id,
        { title, exam_datetime },
        actorId,
    );
    return successResponse(res, updated);
};

exports.deleteSchedule = async (req, res) => {
    const actorId = req.user.user_id;
    await examSchedulesService.deleteSchedule(req.params.schedule_id, actorId);
    return successResponse(res, { message: 'Schedule deleted successfully' });
};
