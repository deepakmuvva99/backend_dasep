const permissionsService = require('../services/permissionsService');
const { successResponse, successListResponse, errorResponse } = require('../utils/responseHandler');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');
const { parseSorting } = require('../utils/sorting');

exports.getAllPermissions = async (req, res) => {
    const filters = {
        search: req.query.search
    };
    const pagination = parsePagination(req.query);
    const sorting = parseSorting(req.query, ['permission_id', 'name', 'created_at'], 'permission_id');

    const { rows, total } = await permissionsService.getAllPermissions(filters, pagination, sorting);
    const meta = buildPaginationMeta(total, pagination.page, pagination.limit);

    return successListResponse(res, rows, meta);
};

exports.getPermissionById = async (req, res) => {
    const permissionId = req.params.id;
    const permission = await permissionsService.getPermissionById(permissionId);
    return successResponse(res, permission);
};

exports.createPermission = async (req, res) => {
    const { name, description } = req.body;
    if (!name) {
        return errorResponse(res, 'BAD_REQUEST', 'Permission name is required', 400);
    }

    const newPermission = await permissionsService.createPermission({ name, description });
    return successResponse(res, newPermission, 201);
};

exports.updatePermission = async (req, res) => {
    const permissionId = req.params.id;
    const updatedPermission = await permissionsService.updatePermission(permissionId, req.body);
    return successResponse(res, updatedPermission);
};

exports.deletePermission = async (req, res) => {
    const permissionId = req.params.id;
    await permissionsService.deletePermission(permissionId);
    return successResponse(res, { message: 'Permission deleted successfully' });
};
