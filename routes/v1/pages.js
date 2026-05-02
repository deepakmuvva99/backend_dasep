const express = require('express');
const router = express.Router();

const pagesController = require('../../controllers/pagesController');
const { verifyToken } = require('../../middlewares/authMiddleware');
const { asyncHandler } = require('../../middlewares/errorMiddleware');

router.use(verifyToken);

router.route('/')
    .post(asyncHandler(pagesController.createPages));

router.get('/version/:version_id', asyncHandler(pagesController.getPages));

router.route('/:page_id')
    .get(asyncHandler(pagesController.getPageDetails))
    .delete(asyncHandler(pagesController.deletePage));

module.exports = router;
