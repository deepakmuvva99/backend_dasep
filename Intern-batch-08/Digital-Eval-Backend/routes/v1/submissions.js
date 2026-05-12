const express = require('express');
const router = express.Router();

const submissionsController = require('../../controllers/submissionsController');
const { verifyToken, restrictTo } = require('../../middlewares/authMiddleware');
const { asyncHandler } = require('../../middlewares/errorMiddleware');

router.use(verifyToken);

router
    .route('/')
    .get(asyncHandler(submissionsController.getSubmissions))
    .post(restrictTo('Student', 'Admin'), asyncHandler(submissionsController.createSubmission));

router.route('/:submission_id').get(asyncHandler(submissionsController.getSubmissionDetails));

router
    .route('/:submission_id/status')
    .put(restrictTo('Admin', 'Faculty'), asyncHandler(submissionsController.updateSubmissionStatus));

module.exports = router;
