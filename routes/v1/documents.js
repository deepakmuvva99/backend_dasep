const express = require('express');
const router = express.Router();

const documentsController = require('../../controllers/documentsController');
const { verifyToken, restrictTo } = require('../../middlewares/authMiddleware');
const { asyncHandler } = require('../../middlewares/errorMiddleware');

router.use(verifyToken);

router.route('/')
    .get(asyncHandler(documentsController.getDocuments))
    .post(restrictTo('Admin', 'Student'), asyncHandler(documentsController.createDocument));

router.get('/submission/:submission_id', asyncHandler(documentsController.getDocumentsBySubmission));

router.route('/:document_id')
    .get(asyncHandler(documentsController.getDocumentDetails))
    .put(restrictTo('Admin', 'Student'), asyncHandler(documentsController.updateDocument))
    .delete(restrictTo('Admin', 'Student'), asyncHandler(documentsController.deleteDocument));

module.exports = router;
