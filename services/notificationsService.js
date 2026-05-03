const notificationsModel = require('../models/notificationsModel');

class NotificationsService {
    async createNotification(data) {
        // Internal utility called by other services or Admin
        return await notificationsModel.createNotification(data);
    }

    async getMyNotifications(userId, pagination, query) {
        let isRead;
        if (query.is_read === 'true') isRead = true;
        else if (query.is_read === 'false') isRead = false;

        const filters = { is_read: isRead };
        return await notificationsModel.getNotifications(userId, pagination, filters);
    }

    async getNotificationDetails(notificationId, userId) {
        const notification = await notificationsModel.findById(notificationId);
        if (!notification) {
            const error = new Error('Notification not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }
        if (notification.user_id !== userId) {
            const error = new Error('Access denied');
            error.statusCode = 403;
            error.code = 'FORBIDDEN';
            throw error;
        }
        return notification;
    }

    async markAsRead(notificationId, userId) {
        const success = await notificationsModel.markAsRead(notificationId, userId);
        if (!success) {
            const error = new Error('Notification not found or access denied');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }
        return true;
    }

    async markAllAsRead(userId) {
        return await notificationsModel.markAllAsRead(userId);
    }

    async deleteNotification(notificationId, userId) {
        const success = await notificationsModel.deleteNotification(notificationId, userId);
        if (!success) {
            const error = new Error('Notification not found or access denied');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }
        return true;
    }
}

module.exports = new NotificationsService();
