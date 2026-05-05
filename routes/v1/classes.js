const express = require('express');
const router = express.Router();

const classesController = require('../../controllers/classesController');
const { verifyToken, restrictTo } = require('../../middlewares/authMiddleware');
const { asyncHandler } = require('../../middlewares/errorMiddleware');

router.use(verifyToken);

router
    .route('/')
    .get(restrictTo('Admin'), asyncHandler(classesController.getClasses))
    .post(restrictTo('Admin'), asyncHandler(classesController.createClass));

router.get('/lookup', asyncHandler(classesController.getClassesLookup));

router
    .route('/:class_id')
    .get(restrictTo('Admin', 'Faculty'), asyncHandler(classesController.getClassDetails))
    .put(restrictTo('Admin'), asyncHandler(classesController.updateClass))
    .delete(restrictTo('Admin'), asyncHandler(classesController.deleteClass));

router
    .route('/:class_id/subjects')
    .get(restrictTo('Admin', 'Faculty'), asyncHandler(classesController.getClassSubjects))
    .post(restrictTo('Admin'), asyncHandler(classesController.addSubjectToClass));

router.delete(
    '/:class_id/subjects/:subject_id',
    restrictTo('Admin'),
    asyncHandler(classesController.removeSubjectFromClass),
);

module.exports = router;
