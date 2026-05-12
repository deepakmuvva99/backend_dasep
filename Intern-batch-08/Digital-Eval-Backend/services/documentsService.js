const documentsModel = require('../models/documentsModel');
const submissionsModel = require('../models/submissionsModel');

class DocumentsService {
    async createDocument(data) {
        // Enforce foreign key constraints actively
        const submission = await submissionsModel.findById(data.submission_id);
        if (!submission) {
            const error = new Error('Submission not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }

        const documentId = await documentsModel.createDocument(data);
        return { document_id: documentId, ...data };
    }

    async getDocuments(query, pagination, sorting) {
        const filters = {
            submission_id: query.submission_id || null,
            student_id: query.student_id || null,
        };
        return await documentsModel.getDocuments(filters, pagination, sorting);
    }

    async getDocumentDetails(documentId) {
        const doc = await documentsModel.findById(documentId);
        if (!doc) {
            const error = new Error('Document not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }
        return doc;
    }

    async getDocumentsBySubmission(submissionId) {
        return await documentsModel.getBySubmissionId(submissionId);
    }

    async updateDocument(documentId, data) {
        await this.getDocumentDetails(documentId);
        await documentsModel.updateDocument(documentId, data);
        return { document_id: documentId, ...data };
    }

    async deleteDocument(documentId) {
        const affectedRows = await documentsModel.deleteDocument(documentId);
        if (affectedRows === 0) {
            const error = new Error('Document not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }
        return true;
    }
}

module.exports = new DocumentsService();
