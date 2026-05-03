const express = require('express');
const router = express.Router();

const rolesController = require('../../controllers/rolesController');
const { verifyToken, restrictTo } = require('../../middlewares/authMiddleware');
const { asyncHandler } = require('../../middlewares/errorMiddleware');

// Roles are strictly Admin resources
router.use(verifyToken);
router.use(restrictTo('Admin'));

router.route('/').get(asyncHandler(rolesController.getRoles)).post(asyncHandler(rolesController.createRole));

router
    .route('/:role_id')
    .put(asyncHandler(rolesController.updateRole))
    .delete(asyncHandler(rolesController.deleteRole));

router
    .route('/:role_id/permissions')
    .get(asyncHandler(rolesController.getRolePermissions))
    .post(asyncHandler(rolesController.assignPermission));

router.route('/:role_id/permissions/:perm_id').delete(asyncHandler(rolesController.removePermission));

module.exports = router;
