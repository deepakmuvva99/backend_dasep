const express = require('express');
const router = express.Router();

const examSchedulesController = require('../../controllers/examSchedulesController');
const { verifyToken, restrictTo, resolveProfile } = require('../../middlewares/authMiddleware');
const { asyncHandler } = require('../../middlewares/errorMiddleware');

router.use(verifyToken);

router
    .route('/')
    .get(resolveProfile, asyncHandler(examSchedulesController.getSchedules)) // Accessible to all logged-in users (Student/Faculty/Admin) usually
    .post(restrictTo('Admin'), asyncHandler(examSchedulesController.createSchedule));

router.get('/types', asyncHandler(examSchedulesController.getExamTypes));

router
    .route('/:schedule_id')
    .get(asyncHandler(examSchedulesController.getScheduleDetails))
    .put(restrictTo('Admin'), asyncHandler(examSchedulesController.updateSchedule))
    .delete(restrictTo('Admin'), asyncHandler(examSchedulesController.deleteSchedule));

module.exports = router;
