const documentsService = require('../services/documentsService');
const { successResponse, successListResponse } = require('../utils/responseHandler');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');
const { parseSorting } = require('../utils/sorting');

exports.createDocument = async (req, res) => {
    const { submission_id, title } = req.body;

    if (!submission_id || !title) {
        return res
            .status(400)
            .json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing submission_id or title' } });
    }

    const document = await documentsService.createDocument({ submission_id, title });
    return successResponse(res, document, 201);
};

exports.getDocuments = async (req, res) => {
    const pagination = parsePagination(req.query);
    const sorting = parseSorting(req.query, ['created_at', 'title'], 'created_at');

    const { rows, total } = await documentsService.getDocuments(req.query, pagination, sorting);
    const meta = buildPaginationMeta(total, pagination.page, pagination.limit);

    return successListResponse(res, rows, meta);
};

exports.getDocumentsBySubmission = async (req, res) => {
    const documents = await documentsService.getDocumentsBySubmission(req.params.submission_id);
    return successResponse(res, documents);
};

exports.getDocumentDetails = async (req, res) => {
    const details = await documentsService.getDocumentDetails(req.params.document_id);
    return successResponse(res, details);
};

exports.updateDocument = async (req, res) => {
    const { title } = req.body;
    const updated = await documentsService.updateDocument(req.params.document_id, { title });
    return successResponse(res, updated);
};

exports.deleteDocument = async (req, res) => {
    await documentsService.deleteDocument(req.params.document_id);
    return successResponse(res, { message: 'Document soft-deleted' });
};
