const express = require('express');
const router = express.Router();

const facultyController = require('../../controllers/facultyController');
const { verifyToken, restrictTo } = require('../../middlewares/authMiddleware');
const { asyncHandler } = require('../../middlewares/errorMiddleware');

router.use(verifyToken);

router.get('/subjects/lookup', asyncHandler(facultyController.getSubjectNamesLookup));
router.get('/lookup', asyncHandler(facultyController.getFacultyLookup));

router
    .route('/')
    .get(restrictTo('Admin'), asyncHandler(facultyController.getFacultyList))
    .post(restrictTo('Admin'), asyncHandler(facultyController.createFaculty));

router
    .route('/:faculty_id')
    .get(restrictTo('Admin', 'Faculty'), asyncHandler(facultyController.getFacultyProfile))
    .put(restrictTo('Admin'), asyncHandler(facultyController.updateFaculty))
    .delete(restrictTo('Admin'), asyncHandler(facultyController.deleteFaculty));

router.route('/:faculty_id/status').put(restrictTo('Admin'), asyncHandler(facultyController.updateFacultyStatus));

router
    .route('/:faculty_id/assignments')
    .get(restrictTo('Admin', 'Faculty'), asyncHandler(facultyController.getFacultyAssignments));

module.exports = router;
