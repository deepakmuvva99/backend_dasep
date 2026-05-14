const express = require('express');
const router = express.Router();

const auditLogsController = require('../../controllers/auditLogsController');
const { verifyToken, restrictTo } = require('../../middlewares/authMiddleware');
const { asyncHandler } = require('../../middlewares/errorMiddleware');

router.use(verifyToken);
router.use(restrictTo('Admin')); // Audit logs strictly accessible to Admins only

router.get('/stats', asyncHandler(auditLogsController.getDashboardStats));

router
    .route('/')
    .get(asyncHandler(auditLogsController.getLogs))
    .delete(asyncHandler(auditLogsController.cleanupLogs));

router.get('/:audit_log_id', asyncHandler(auditLogsController.getLogDetails));

module.exports = router;
