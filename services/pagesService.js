const pagesModel = require('../models/pagesModel');
const filesService = require('../services/filesService'); // Verify version exists

class PagesService {
    async createPages(fileId, versionId, pagesData) {
        // Validation could be added here
        const affectedRows = await pagesModel.createPages(fileId, versionId, pagesData);
        return { version_id: versionId, pages_created: affectedRows };
    }

    async getPages(versionId) {
        return await pagesModel.getPagesByVersionId(versionId);
    }

    async getPageDetails(pageId) {
        const page = await pagesModel.findById(pageId);
        if (!page) {
            const error = new Error('Page not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }
        return page;
    }

    async deletePage(pageId) {
        const affected = await pagesModel.deletePage(pageId);
        if (affected === 0) {
            const error = new Error('Page not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }
        return true;
    }
}

module.exports = new PagesService();
