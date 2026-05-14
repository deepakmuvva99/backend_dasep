const db = require('../config/database');

class AuditLogsModel {
    async logAction(data) {
        const [result] = await db.execute(
            `INSERT INTO audit_logs (entity_type, entity_id, field_name, old_value, new_value, ip_address, user_agent, user_role, changed_by_user_id, changed_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                data.entity_type,
                data.entity_id,
                data.field_name || null,
                data.old_value || null,
                data.new_value || null,
                data.ip_address || null,
                data.user_agent || null,
                data.user_role || null,
                data.changed_by_user_id,
            ],
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
        if (filters.user_id) {
            conditions.push(`a.changed_by_user_id = ?`);
            params.push(filters.user_id);
        }
        if (filters.user_role) {
            conditions.push(`a.user_role = ?`);
            params.push(filters.user_role);
        }
        if (filters.grade) {
            // This is a complex filter: find logs related to students in a specific grade
            // For now, we filter by entity_type 'submissions' or 'evaluations' linked to that grade
            if (filters.entity_type === 'submissions' || !filters.entity_type) {
                conditions.push(`(
                    (a.entity_type = 'submissions' AND a.entity_id IN (
                        SELECT s.submission_id FROM submissions s 
                        JOIN students stu ON s.student_id = stu.student_id 
                        JOIN classes c ON stu.class_id = c.class_id 
                        WHERE c.grade = ?
                    )) OR a.entity_type != 'submissions'
                )`);
                params.push(filters.grade);
            }
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
        const [countRows] = await db.query(countQuery, params);
        const total = countRows[0].total;

        const dataParams = [...params, Number(pagination.limit), Number(pagination.offset)];
        query += ` ORDER BY a.changed_at DESC LIMIT ? OFFSET ?`;

        const [rows] = await db.query(query, dataParams);
        return { rows, total };
    }

    async getDashboardStats() {
        // 1. Total Logins by Role
        const [loginStats] = await db.execute(`
            SELECT user_role, COUNT(*) as count 
            FROM audit_logs 
            WHERE entity_type = 'auth' AND field_name = 'login' 
            GROUP BY user_role
        `);

        // 2. Tasks Created Today (Submissions + Evaluations)
        const [taskStats] = await db.execute(`
            SELECT COUNT(*) as count 
            FROM audit_logs 
            WHERE (entity_type = 'submissions' OR entity_type = 'evaluations') 
            AND field_name = 'all' 
            AND DATE(changed_at) = CURDATE()
        `);

        // 3. Submissions by Grade
        const [submissionByGrade] = await db.execute(`
            SELECT c.grade, COUNT(*) as count
            FROM audit_logs a
            JOIN submissions s ON a.entity_id = s.submission_id
            JOIN students stu ON s.student_id = stu.student_id
            JOIN classes c ON stu.class_id = c.class_id
            WHERE a.entity_type = 'submissions' AND a.field_name = 'all'
            GROUP BY c.grade
        `);

        return {
            logins: loginStats,
            tasksToday: taskStats[0].count,
            submissionsByGrade: submissionByGrade
        };
    }

    async findById(auditLogId) {
        const [rows] = await db.execute(
            `SELECT a.*, a.audit_log_id as id, u.name as user_name FROM audit_logs a JOIN users u ON a.changed_by_user_id = u.user_id WHERE a.audit_log_id = ?`,
            [auditLogId],
        );
        return rows[0];
    }

    async getByEntity(entityType, entityId) {
        const [rows] = await db.execute(
            `SELECT a.*, u.name as user_name FROM audit_logs a JOIN users u ON a.changed_by_user_id = u.user_id WHERE a.entity_type = ? AND a.entity_id = ? ORDER BY a.changed_at DESC`,
            [entityType, entityId],
        );
        return rows;
    }

    async deleteOldLogs(days) {
        const [result] = await db.execute(
            `DELETE FROM audit_logs WHERE changed_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
            [days],
        );
        return result.affectedRows;
    }
}

module.exports = new AuditLogsModel();
