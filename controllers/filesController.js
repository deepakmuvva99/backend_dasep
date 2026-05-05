const filesService = require('../services/filesService');
const { successResponse, successListResponse } = require('../utils/responseHandler');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

exports.getFileTypes = async (req, res) => {
    const types = await filesService.getFileTypes();
    return successResponse(res, types);
};

exports.uploadFile = async (req, res) => {
    const { document_id, original_file_name, mime_type, file_size_kb, file_type_id, blob_name, container_name, etag } =
        req.body;

    if (!document_id || !original_file_name || !blob_name || !container_name) {
        return res
            .status(400)
            .json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing required upload fields' } });
    }

    const result = await filesService.uploadNewFile({
        document_id,
        original_file_name,
        mime_type,
        file_size_kb,
        file_type_id,
        blob_name,
        container_name,
        etag,
    });

    return successResponse(res, result, 201);
};

exports.uploadVersion = async (req, res) => {
    const fileId = req.params.file_id;
    const { blob_name, container_name, etag } = req.body;

    if (!blob_name || !container_name) {
        return res
            .status(400)
            .json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing version fields' } });
    }

    const result = await filesService.uploadNewVersion(fileId, { blob_name, container_name, etag });
    return successResponse(res, result, 201);
};

exports.getFileDetails = async (req, res) => {
    const details = await filesService.getFileDetails(req.params.file_id);
    return successResponse(res, details);
};

exports.getVersions = async (req, res) => {
    const pagination = parsePagination(req.query);
    const fileId = req.params.file_id;

    const { rows, total } = await filesService.getVersions(fileId, pagination);
    const meta = buildPaginationMeta(total, pagination.page, pagination.limit);

    return successListResponse(res, rows, meta);
};

exports.getCurrentVersion = async (req, res) => {
    const result = await filesService.getCurrentVersion(req.params.file_id);
    return successResponse(res, result);
};

exports.deleteFile = async (req, res) => {
    await filesService.deleteFile(req.params.file_id);
    return successResponse(res, { message: 'File soft-deleted' });
};

exports.getSasToken = async (req, res) => {
    const fileId = req.params.file_id;
    const { permissions } = req.query; // 'r' or 'w'

    const result = await filesService.getSasToken(fileId, permissions || 'r');
    return successResponse(res, result);
};

exports.requestUpload = async (req, res) => {
    const { file_name } = req.body;
    if (!file_name) {
        return res
            .status(400)
            .json({ success: false, error: { code: 'BAD_REQUEST', message: 'file_name is required' } });
    }

    const result = await filesService.requestUploadUrl(file_name);
    return successResponse(res, result);
};
