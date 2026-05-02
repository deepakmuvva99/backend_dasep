const db = require('../config/database');

class NotificationsModel {
    async createNotification(data) {
        const [result] = await db.execute(
            `INSERT INTO notifications (user_id, entity_type, entity_id, message, sent_at, is_read)
             VALUES (?, ?, ?, ?, NOW(), 0)`,
            [data.user_id, data.entity_type, data.entity_id, data.message]
        );
        return result.insertId;
    }

    async getNotifications(userId, pagination, filters) {
        let query = `SELECT *, notification_id as id FROM notifications WHERE user_id = ?`;
        const params = [userId];

        if (filters.is_read !== undefined) {
            query += ` AND is_read = ?`;
            params.push(filters.is_read ? 1 : 0);
        }

        const [countRows] = await db.execute(`SELECT COUNT(*) as total FROM (${query}) as sub`, params);
        const total = countRows[0].total;

        query += ` ORDER BY sent_at DESC LIMIT ? OFFSET ?`;
        params.push(pagination.limit, pagination.offset);

        const [rows] = await db.execute(query, params);
        return { rows, total };
    }

    async findById(notificationId) {
        const [rows] = await db.execute(`SELECT *, notification_id as id FROM notifications WHERE notification_id = ?`, [notificationId]);
        return rows[0];
    }

    async markAsRead(notificationId, userId) {
        const [result] = await db.execute(
            `UPDATE notifications SET is_read = 1, read_at = NOW() WHERE notification_id = ? AND user_id = ?`,
            [notificationId, userId]
        );
        return result.affectedRows;
    }

    async markAllAsRead(userId) {
        const [result] = await db.execute(
            `UPDATE notifications SET is_read = 1, read_at = NOW() WHERE user_id = ? AND is_read = 0`,
            [userId]
        );
        return result.affectedRows;
    }

    async deleteNotification(notificationId, userId) {
        const [result] = await db.execute(
            `DELETE FROM notifications WHERE notification_id = ? AND user_id = ?`,
            [notificationId, userId]
        );
        return result.affectedRows;
    }
}

module.exports = new NotificationsModel();
