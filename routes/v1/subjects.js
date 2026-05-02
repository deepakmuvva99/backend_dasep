const express = require('express');
const router = express.Router();

const subjectsController = require('../../controllers/subjectsController');
const { verifyToken, restrictTo } = require('../../middlewares/authMiddleware');
const { asyncHandler } = require('../../middlewares/errorMiddleware');

// Route safeguards
router.use(verifyToken);

router.route('/')
    .get(restrictTo('Admin', 'Faculty'), asyncHandler(subjectsController.getSubjects))
    .post(restrictTo('Admin'), asyncHandler(subjectsController.createSubject));

router.get('/lookup', asyncHandler(subjectsController.getSubjectsLookup));

router.route('/:subject_id')
    .get(restrictTo('Admin', 'Faculty'), asyncHandler(subjectsController.getSubjectDetails))
    .put(restrictTo('Admin'), asyncHandler(subjectsController.updateSubject))
    .delete(restrictTo('Admin'), asyncHandler(subjectsController.deleteSubject));

module.exports = router;
