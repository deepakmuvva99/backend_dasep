const db = require('../config/database');

class AuditLogsModel {
    async logAction(data) {
        const [result] = await db.execute(
            `INSERT INTO audit_logs (entity_type, entity_id, field_name, old_value, new_value, changed_by_user_id, changed_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [
                data.entity_type, 
                data.entity_id, 
                data.field_name || null, 
                data.old_value || null, 
                data.new_value || null, 
                data.changed_by_user_id
            ]
        );
        return result.insertId;
    }

    async getLogs(filters, pagination) {
        let query = `
            SELECT a.*, a.audit_log_id as id, u.name as user_name
            FROM audit_logs a
            JOIN users u ON a.changed_by_user_id = u.user_id
        `;
        const params = [];
        const conditions = [];

        if (filters.entity_type) {
            conditions.push(`a.entity_type = ?`);
            params.push(filters.entity_type);
        }
        if (filters.entity_id) {
            conditions.push(`a.entity_id = ?`);
            params.push(filters.entity_id);
        }
        if (filters.user_id) {
            conditions.push(`a.changed_by_user_id = ?`);
            params.push(filters.user_id);
        }
        if (filters.date_from) {
            conditions.push(`a.changed_at >= ?`);
            params.push(filters.date_from);
        }
        if (filters.date_to) {
            conditions.push(`a.changed_at <= ?`);
            params.push(filters.date_to + ' 23:59:59');
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        const countQuery = `SELECT COUNT(*) as total FROM (${query}) as sub`;
        const [countRows] = await db.execute(countQuery, params);
        const total = countRows[0].total;

        query += ` ORDER BY a.changed_at DESC LIMIT ? OFFSET ?`;
        params.push(pagination.limit, pagination.offset);

        const [rows] = await db.execute(query, params);
        return { rows, total };
    }

    async findById(auditLogId) {
        const [rows] = await db.execute(
            `SELECT a.*, a.audit_log_id as id, u.name as user_name FROM audit_logs a JOIN users u ON a.changed_by_user_id = u.user_id WHERE a.audit_log_id = ?`,
            [auditLogId]
        );
        return rows[0];
    }

    async getByEntity(entityType, entityId) {
        const [rows] = await db.execute(
            `SELECT a.*, u.name as user_name FROM audit_logs a JOIN users u ON a.changed_by_user_id = u.user_id WHERE a.entity_type = ? AND a.entity_id = ? ORDER BY a.changed_at DESC`,
            [entityType, entityId]
        );
        return rows;
    }
}

module.exports = new AuditLogsModel();
