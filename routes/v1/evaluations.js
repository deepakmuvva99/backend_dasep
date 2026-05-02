const express = require('express');
const router = express.Router();

const evaluationsController = require('../../controllers/evaluationsController');
const { verifyToken, restrictTo } = require('../../middlewares/authMiddleware');
const { asyncHandler } = require('../../middlewares/errorMiddleware');

router.use(verifyToken);

router.route('/')
    .get(asyncHandler(evaluationsController.getEvaluations))
    .post(restrictTo('Faculty'), asyncHandler(evaluationsController.createEvaluation));

router.get('/statuses', asyncHandler(evaluationsController.getEvaluationStatuses));

router.get('/submission/:submission_id', asyncHandler(evaluationsController.getEvaluationBySubmission));

router.get('/faculty/:faculty_id', restrictTo('Admin', 'Faculty'), asyncHandler(evaluationsController.getEvaluationsByFaculty));

router.route('/:evaluation_id')
    .get(asyncHandler(evaluationsController.getEvaluationDetails))
    .put(restrictTo('Faculty', 'Admin'), asyncHandler(evaluationsController.updateEvaluation));

module.exports = router;
