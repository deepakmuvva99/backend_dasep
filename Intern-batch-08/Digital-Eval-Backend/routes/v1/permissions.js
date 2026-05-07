const express = require('express');
const router = express.Router();
const permissionsController = require('../../controllers/permissionsController');
const { verifyToken, restrictTo } = require('../../middlewares/authMiddleware');
const { asyncHandler } = require('../../middlewares/errorMiddleware');

router.use(verifyToken);
router.use(restrictTo('Admin'));

// CRUD endpoints for permissions
router.get('/', asyncHandler(permissionsController.getAllPermissions));
router.get('/:id', asyncHandler(permissionsController.getPermissionById));
router.post('/', asyncHandler(permissionsController.createPermission));
router.put('/:id', asyncHandler(permissionsController.updatePermission));
router.delete('/:id', asyncHandler(permissionsController.deletePermission));

module.exports = router;
