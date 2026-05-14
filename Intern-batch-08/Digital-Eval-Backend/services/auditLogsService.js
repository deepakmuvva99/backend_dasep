const auditLogsModel = require('../models/auditLogsModel');

class AuditLogsService {
    async logAction(data, context = {}) {
        // Enriched data with context information (IP, Role, User Agent)
        const enrichedData = {
            ...data,
            ip_address: context.ip || data.ip_address || null,
            user_role: context.role || data.user_role || null,
            user_agent: context.userAgent || data.user_agent || null,
            changed_by_user_id: data.changed_by_user_id || context.user_id
        };
        return await auditLogsModel.logAction(enrichedData);
    }

    async getLogs(query, pagination) {
        const filters = {
            entity_type: query.entity_type || null,
            entity_id: query.entity_id || null,
            user_id: query.user_id || null,
            user_role: query.user_role || null,
            grade: query.grade || null,
            date_from: query.date_from || null,
            date_to: query.date_to || null,
        };
        return await auditLogsModel.getLogs(filters, pagination);
    }

    async getDashboardStats() {
        return await auditLogsModel.getDashboardStats();
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

    async cleanupOldLogs(days = 90) {
        return await auditLogsModel.deleteOldLogs(days);
    }
}

module.exports = new AuditLogsService();
