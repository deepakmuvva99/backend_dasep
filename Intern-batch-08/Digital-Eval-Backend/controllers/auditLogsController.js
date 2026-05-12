const auditLogsService = require('../services/auditLogsService');
const { successResponse, successListResponse } = require('../utils/responseHandler');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

exports.getAuditLogs = async (req, res) => {
    const pagination = parsePagination(req.query);
    const { rows, total } = await auditLogsService.getLogs(req.query, pagination);
    const meta = buildPaginationMeta(total, pagination.page, pagination.limit);

    return successListResponse(res, rows, meta);
};

exports.getAuditLogDetails = async (req, res) => {
    const log = await auditLogsService.getAuditLogDetails(req.params.audit_log_id);
    return successResponse(res, log);
};

exports.getAuditLogByEntity = async (req, res) => {
    const { entity_type, entity_id } = req.params;
    const history = await auditLogsService.getAuditLogsByEntity(entity_type, entity_id);
    return successResponse(res, history);
};
