const express = require('express');
const router = express.Router();

const auditLogsController = require('../../controllers/auditLogsController');
const { verifyToken, restrictTo } = require('../../middlewares/authMiddleware');
const { asyncHandler } = require('../../middlewares/errorMiddleware');

router.use(verifyToken);
router.use(restrictTo('Admin')); // Audit logs strictly accessible to Admins only

router.route('/').get(asyncHandler(auditLogsController.getAuditLogs));

router.get('/:audit_log_id', asyncHandler(auditLogsController.getAuditLogDetails));

router.get('/entity/:entity_type/:entity_id', asyncHandler(auditLogsController.getAuditLogByEntity));

module.exports = router;
