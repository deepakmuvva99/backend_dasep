const auditLogsModel = require('../models/auditLogsModel');

class AuditLogsService {
    async logAction(userId, action, resource, details, ipAddress) {
        // Core internal service not necessarily exposed via an external POST, 
        // to be utilized by interceptors or controllers internally.
        return await auditLogsModel.logAction(userId, action, resource, details, ipAddress);
    }

    async getLogs(query, pagination) {
        const filters = {
            entity_type: query.entity_type || null,
            entity_id: query.entity_id || null,
            user_id: query.user_id || null,
            date_from: query.date_from || null,
            date_to: query.date_to || null
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
