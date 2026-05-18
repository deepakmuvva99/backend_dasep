const express = require('express');
const router = express.Router();

const usersController = require('../../controllers/usersController');
const { verifyToken, restrictTo } = require('../../middlewares/authMiddleware');
const { asyncHandler } = require('../../middlewares/errorMiddleware');

// Note: For now, if verifyToken is bypassed during manual testing without Auth module, it must be adapted.
// We will apply the JWT middleware. The prompt notes we must follow strict architecture constraints.

// Apply token verification to all user routes
router.use(verifyToken);

router
    .route('/')
    .post(restrictTo('Admin'), asyncHandler(usersController.createUser))
    .get(restrictTo('Admin'), asyncHandler(usersController.getUsers));

router
    .route('/:user_id')
    // Both Admin and self can view profile, handled in service logically
    .get(asyncHandler(usersController.getUserProfile))
    .put(restrictTo('Admin'), asyncHandler(usersController.updateUser))
    .delete(restrictTo('Admin'), asyncHandler(usersController.deleteUser));

router.post('/:user_id/change-password', asyncHandler(usersController.changePassword));

router.post('/:user_id/reset-password', restrictTo('Admin'), asyncHandler(usersController.adminResetPassword));

router
    .route('/:user_id/roles')
    .get(restrictTo('Admin'), asyncHandler(usersController.getUserRoles))
    .post(restrictTo('Admin'), asyncHandler(usersController.assignRole));

router.route('/:user_id/roles/:role_id').delete(restrictTo('Admin'), asyncHandler(usersController.removeRole));

module.exports = router;
