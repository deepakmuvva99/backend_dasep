const db = require('../config/database');

class NotificationsModel {
    async createNotification(data) {
        const [result] = await db.execute(
            `INSERT INTO notifications (user_id, entity_type, entity_id, message, sent_at, is_read)
             VALUES (?, ?, ?, ?, NOW(), 0)`,
            [data.user_id, data.entity_type, data.entity_id, data.message],
        );
        return result.insertId;
    }

    async getNotifications(userId, pagination, filters) {
        let baseQuery = `FROM notifications WHERE user_id = ?`;
        const params = [userId];

        if (filters.is_read !== undefined) {
            baseQuery += ` AND is_read = ?`;
            params.push(filters.is_read ? 1 : 0);
        }

        const countQuery = `SELECT COUNT(*) as total ${baseQuery}`;
        const [countRows] = await db.query(countQuery, params);
        const total = countRows[0].total;

        const dataQuery = `SELECT *, notification_id as id ${baseQuery} ORDER BY sent_at DESC LIMIT ? OFFSET ?`;
        const dataParams = [...params, Number(pagination.limit), Number(pagination.offset)];

        const [rows] = await db.query(dataQuery, dataParams);
        return { rows, total };
    }

    async findById(notificationId) {
        const [rows] = await db.execute(
            `SELECT *, notification_id as id FROM notifications WHERE notification_id = ?`,
            [notificationId],
        );
        return rows[0];
    }

    async markAsRead(notificationId, userId) {
        const [result] = await db.execute(
            `UPDATE notifications SET is_read = 1, read_at = NOW() WHERE notification_id = ? AND user_id = ?`,
            [notificationId, userId],
        );
        return result.affectedRows;
    }

    async markAllAsRead(userId) {
        const [result] = await db.execute(
            `UPDATE notifications SET is_read = 1, read_at = NOW() WHERE user_id = ? AND is_read = 0`,
            [userId],
        );
        return result.affectedRows;
    }

    async deleteNotification(notificationId, userId) {
        const [result] = await db.execute(`DELETE FROM notifications WHERE notification_id = ? AND user_id = ?`, [
            notificationId,
            userId,
        ]);
        return result.affectedRows;
    }
}

module.exports = new NotificationsModel();
