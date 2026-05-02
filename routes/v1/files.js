const express = require('express');
const router = express.Router();

const filesController = require('../../controllers/filesController');
const { verifyToken } = require('../../middlewares/authMiddleware');
const { asyncHandler } = require('../../middlewares/errorMiddleware');

router.use(verifyToken);

router.get('/types', asyncHandler(filesController.getFileTypes));

router.route('/')
    .post(asyncHandler(filesController.uploadFile));

router.route('/:file_id')
    .get(asyncHandler(filesController.getFileDetails))
    .delete(asyncHandler(filesController.deleteFile));

router.route('/:file_id/versions')
    .get(asyncHandler(filesController.getVersions))
    .post(asyncHandler(filesController.uploadVersion));

router.get('/:file_id/versions/current', asyncHandler(filesController.getCurrentVersion));

module.exports = router;
