const pagesService = require('../services/pagesService');
const { successResponse } = require('../utils/responseHandler');

exports.createPages = async (req, res) => {
    const { version_id, pages } = req.body;

    if (!version_id || !Array.isArray(pages) || pages.length === 0) {
        return res.status(400).json({
            success: false,
            error: { code: 'BAD_REQUEST', message: 'version_id and pages array are required' },
        });
    }

    const result = await pagesService.createPages(version_id, pages);
    return successResponse(res, result, 201);
};

exports.getPages = async (req, res) => {
    const versionId = req.params.version_id;
    const pages = await pagesService.getPages(versionId);
    return successResponse(res, pages);
};

exports.getPageDetails = async (req, res) => {
    const pageId = req.params.page_id;
    const details = await pagesService.getPageDetails(pageId);
    return successResponse(res, details);
};

exports.deletePage = async (req, res) => {
    await pagesService.deletePage(req.params.page_id);
    return successResponse(res, { message: 'Page deleted' });
};
