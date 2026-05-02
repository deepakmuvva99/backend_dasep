const express = require('express');
const router = express.Router();

const assignmentsController = require('../../controllers/assignmentsController');
const { verifyToken, restrictTo } = require('../../middlewares/authMiddleware');
const { asyncHandler } = require('../../middlewares/errorMiddleware');

router.use(verifyToken);
router.use(restrictTo('Admin')); // All broad assignments routes are Admin only in docs

router.route('/')
    .get(asyncHandler(assignmentsController.getAssignments))
    .post(asyncHandler(assignmentsController.createAssignment));

router.route('/:assignment_id')
    .get(asyncHandler(assignmentsController.getAssignmentDetails))
    .put(asyncHandler(assignmentsController.updateAssignment))
    .delete(asyncHandler(assignmentsController.deleteAssignment));

module.exports = router;
