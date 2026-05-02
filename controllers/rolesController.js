const rolesService = require('../services/rolesService');
const { successResponse, successListResponse } = require('../utils/responseHandler');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

exports.createRole = async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Name is required' }});

    const newRole = await rolesService.createRole(name);
    return successResponse(res, newRole, 201);
};

exports.getRoles = async (req, res) => {
    const pagination = parsePagination(req.query);
    const { rows, total } = await rolesService.getRoles(req.query, pagination);
    const meta = buildPaginationMeta(total, pagination.page, pagination.limit);

    return successListResponse(res, rows, meta);
};

exports.updateRole = async (req, res) => {
    const { name } = req.body;
    const roleId = req.params.role_id;
    
    if (!name) return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Name is required' }});

    const updated = await rolesService.updateRole(roleId, name);
    return successResponse(res, updated);
};

exports.deleteRole = async (req, res) => {
    const roleId = req.params.role_id;
    await rolesService.deleteRole(roleId);
    return successResponse(res, { message: 'Role deleted successfully' });
};

exports.getRolePermissions = async (req, res) => {
    const roleId = req.params.role_id;
    const permissions = await rolesService.getRolePermissions(roleId);
    return successResponse(res, permissions);
};

exports.assignPermission = async (req, res) => {
    const roleId = req.params.role_id;
    const { permission_id } = req.body;

    if (!permission_id) return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'permission_id is required' }});

    await rolesService.assignPermission(roleId, permission_id);
    return successResponse(res, { message: 'Permission assigned' }, 201);
};

exports.removePermission = async (req, res) => {
    const { role_id, perm_id } = req.params;
    await rolesService.removePermission(role_id, perm_id);
    return successResponse(res, { message: 'Permission removed' });
};
