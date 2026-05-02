const express = require('express');
const router = express.Router();

const annotationsController = require('../../controllers/annotationsController');
const { verifyToken, restrictTo } = require('../../middlewares/authMiddleware');
const { asyncHandler } = require('../../middlewares/errorMiddleware');

router.use(verifyToken);

router.route('/')
    .post(restrictTo('Faculty'), asyncHandler(annotationsController.createAnnotation));

router.route('/page/:page_id')
    .get(asyncHandler(annotationsController.getAnnotations));

router.get('/evaluation/:eval_id', asyncHandler(annotationsController.getAnnotationsByEvaluation));

router.route('/:annotation_id')
    .get(asyncHandler(annotationsController.getAnnotationDetails))
    .put(restrictTo('Faculty', 'Admin'), asyncHandler(annotationsController.updateAnnotation))
    .delete(restrictTo('Faculty', 'Admin'), asyncHandler(annotationsController.deleteAnnotation));

module.exports = router;
