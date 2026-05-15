const pagesModel = require('../models/pagesModel');

class PagesService {
    async createPages(versionId, pagesData) {
        // Validation could be added here
        const affectedRows = await pagesModel.createPages(versionId, pagesData);
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

    async getOrCreatePage(versionId, pageNumber) {
        const pages = await pagesModel.getPagesByVersionId(versionId);
        let page = pages.find(p => p.page_number === pageNumber);
        
        if (!page) {
            // Create the page on the fly
            await pagesModel.createPages(versionId, [{ page_number: pageNumber }]);
            const updatedPages = await pagesModel.getPagesByVersionId(versionId);
            page = updatedPages.find(p => p.page_number === pageNumber);
        }
        return page;
    }
}

module.exports = new PagesService();
