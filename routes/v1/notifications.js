const express = require('express');
const router = express.Router();

const notificationsController = require('../../controllers/notificationsController');
const { verifyToken, restrictTo } = require('../../middlewares/authMiddleware');
const { asyncHandler } = require('../../middlewares/errorMiddleware');

router.use(verifyToken);

router.route('/')
    .get(asyncHandler(notificationsController.getMyNotifications))
    .post(restrictTo('Admin'), asyncHandler(notificationsController.createNotification));

router.put('/read-all', asyncHandler(notificationsController.markAllAsRead));

router.route('/:notification_id')
    .get(asyncHandler(notificationsController.getNotificationDetails))
    .delete(asyncHandler(notificationsController.deleteNotification));

router.put('/:notification_id/read', asyncHandler(notificationsController.markAsRead));

module.exports = router;
