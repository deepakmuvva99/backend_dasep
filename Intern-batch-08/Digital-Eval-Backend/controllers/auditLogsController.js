const auditLogsService = require('../services/auditLogsService');
const { successResponse, successListResponse } = require('../utils/responseHandler');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

exports.getLogs = async (req, res) => {
    const pagination = parsePagination(req.query);
    const { rows, total } = await auditLogsService.getLogs(req.query, pagination);
    const meta = buildPaginationMeta(total, pagination.page, pagination.limit);

    return successListResponse(res, rows, meta);
};

exports.getLogDetails = async (req, res) => {
    const log = await auditLogsService.getAuditLogDetails(req.params.audit_log_id);
    return successResponse(res, log);
};

exports.getDashboardStats = async (req, res) => {
    const stats = await auditLogsService.getDashboardStats();
    return successResponse(res, stats);
};

exports.cleanupLogs = async (req, res) => {
    const { days } = req.body;
    const count = await auditLogsService.cleanupOldLogs(days);
    return successResponse(res, { message: `${count} old logs removed` });
};
