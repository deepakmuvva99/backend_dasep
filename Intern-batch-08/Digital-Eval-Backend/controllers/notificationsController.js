const notificationsService = require('../services/notificationsService');
const { successResponse, successListResponse } = require('../utils/responseHandler');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

exports.getMyNotifications = async (req, res) => {
    const pagination = parsePagination(req.query);
    const userId = req.user.user_id;

    const { rows, total } = await notificationsService.getMyNotifications(userId, pagination, req.query);
    const meta = buildPaginationMeta(total, pagination.page, pagination.limit);

    return successListResponse(res, rows, meta);
};

exports.getNotificationDetails = async (req, res) => {
    const userId = req.user.user_id;
    const notification = await notificationsService.getNotificationDetails(req.params.notification_id, userId);
    return successResponse(res, notification);
};

exports.markAsRead = async (req, res) => {
    const notificationId = req.params.notification_id;
    const userId = req.user.user_id;

    await notificationsService.markAsRead(notificationId, userId);
    return successResponse(res, { message: 'Notification marked as read' });
};

exports.markAllAsRead = async (req, res) => {
    const userId = req.user.user_id;
    const updated = await notificationsService.markAllAsRead(userId);
    return successResponse(res, { message: `${updated} notifications marked as read` });
};

exports.deleteNotification = async (req, res) => {
    const userId = req.user.user_id;
    await notificationsService.deleteNotification(req.params.notification_id, userId);
    return successResponse(res, { message: 'Notification deleted' });
};

exports.createNotification = async (req, res) => {
    const { user_id, entity_type, entity_id, message } = req.body;
    if (!user_id || !message) {
        return res
            .status(400)
            .json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing required fields' } });
    }
    const result = await notificationsService.createNotification({ user_id, entity_type, entity_id, message });
    return successResponse(res, { notification_id: result }, 201);
};
