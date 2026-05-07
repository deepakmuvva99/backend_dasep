const express = require('express');
const router = express.Router();

const studentsController = require('../../controllers/studentsController');
const { verifyToken, restrictTo, resolveProfile } = require('../../middlewares/authMiddleware');
const { asyncHandler } = require('../../middlewares/errorMiddleware');

router.use(verifyToken);

router
    .route('/')
    .get(restrictTo('Admin'), asyncHandler(studentsController.getStudents))
    .post(restrictTo('Admin'), asyncHandler(studentsController.createStudent));

router
    .route('/:student_id')
    .get(resolveProfile, restrictTo('Admin', 'Faculty', 'Student'), asyncHandler(studentsController.getStudentProfile))
    .put(restrictTo('Admin'), asyncHandler(studentsController.updateStudent))
    .delete(restrictTo('Admin'), asyncHandler(studentsController.deleteStudent));

router.route('/:student_id/status').put(restrictTo('Admin'), asyncHandler(studentsController.updateStudentStatus));

router
    .route('/:student_id/submissions')
    .get(restrictTo('Admin', 'Student'), asyncHandler(studentsController.getStudentSubmissions));

module.exports = router;
