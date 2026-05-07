const auditLogsModel = require('../models/auditLogsModel');

class AuditLogsService {
    async logAction(data) {
        // Core internal service utilized by other services/controllers to record changes.
        return await auditLogsModel.logAction(data);
    }

    async getLogs(query, pagination) {
        const filters = {
            entity_type: query.entity_type || null,
            entity_id: query.entity_id || null,
            user_id: query.user_id || null,
            date_from: query.date_from || null,
            date_to: query.date_to || null,
        };
        return await auditLogsModel.getLogs(filters, pagination);
    }

    async getAuditLogDetails(auditLogId) {
        const log = await auditLogsModel.findById(auditLogId);
        if (!log) {
            const error = new Error('Audit log entry not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }
        return log;
    }

    async getAuditLogsByEntity(entityType, entityId) {
        return await auditLogsModel.getByEntity(entityType, entityId);
    }
}

module.exports = new AuditLogsService();
