const express = require('express');
const router = express.Router();

const submissionsController = require('../../controllers/submissionsController');
const { verifyToken, restrictTo, resolveProfile } = require('../../middlewares/authMiddleware');
const { asyncHandler } = require('../../middlewares/errorMiddleware');

router.use(verifyToken);

router
    .route('/')
    .get(resolveProfile, asyncHandler(submissionsController.getSubmissions))
    .post(resolveProfile, restrictTo('Student', 'Admin'), asyncHandler(submissionsController.createSubmission));

router.route('/:submission_id').get(asyncHandler(submissionsController.getSubmissionDetails));

router
    .route('/:submission_id/status')
    .put(restrictTo('Admin', 'Faculty'), asyncHandler(submissionsController.updateSubmissionStatus));

module.exports = router;
