const usersService = require('../services/usersService');
const { successResponse, successListResponse } = require('../utils/responseHandler');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');
const { parseSorting } = require('../utils/sorting');

exports.createUser = async (req, res) => {
    const { name, email, password, role_id } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing fields' } });
    }

    const actorId = req.user ? req.user.user_id : null; 
    const newUser = await usersService.createUser({ name, email, password, role_id }, actorId);
    return successResponse(res, newUser, 201);
};

exports.getUsers = async (req, res) => {
    const pagination = parsePagination(req.query);
    const sorting = parseSorting(req.query, ['name', 'email', 'created_at'], 'created_at');

    const { rows, total } = await usersService.getUsers(req.query, pagination, sorting);
    const meta = buildPaginationMeta(total, pagination.page, pagination.limit);

    return successListResponse(res, rows, meta);
};

exports.getUserProfile = async (req, res) => {
    let userId = req.params.user_id;
    if (userId === 'me') userId = req.user.user_id;
    
    // Assume req.user is populated by authMiddleware
    const requestId = req.user.user_id;
    const requestRole = req.user.role;

    const user = await usersService.getUserProfile(userId, requestId, requestRole);
    return successResponse(res, user);
};

exports.updateUser = async (req, res) => {
    const userId = req.params.user_id;
    const { name, email } = req.body;

    const actorId = req.user.user_id;
    const updatedUser = await usersService.updateUser(userId, { name, email }, actorId);
    return successResponse(res, updatedUser);
};

exports.deleteUser = async (req, res) => {
    const userId = req.params.user_id;
    const actorId = req.user.user_id;
    await usersService.deleteUser(userId, actorId);
    return successResponse(res, { message: 'User soft-deleted successfully' });
};

exports.changePassword = async (req, res) => {
    let userId = req.params.user_id;
    if (userId === 'me') userId = req.user.user_id;

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            error: { code: 'BAD_REQUEST', message: 'Current and new passwords are required' },
        });
    }

    const requestId = req.user.user_id;
    const requestRole = req.user.role;

    await usersService.changePassword(userId, currentPassword, newPassword, requestId, requestRole);

    return successResponse(res, { message: 'Password changed successfully' });
};

exports.adminResetPassword = async (req, res) => {
    const userId = req.params.user_id;
    const { newPassword } = req.body;

    if (!newPassword) {
        return res.status(400).json({
            success: false,
            error: { code: 'BAD_REQUEST', message: 'New password is required' },
        });
    }

    const actorId = req.user.user_id;

    await usersService.adminResetPassword(userId, newPassword, actorId);

    return successResponse(res, { message: 'Password reset successfully by admin' });
};

exports.getUserRoles = async (req, res) => {
    const userId = req.params.user_id;
    const roles = await usersService.getUserRoles(userId);
    return successResponse(res, roles);
};

exports.assignRole = async (req, res) => {
    const userId = req.params.user_id;
    const actorId = req.user.user_id;
    await usersService.assignRole(userId, req.body, actorId);
    return successResponse(res, { message: 'Role assigned successfully' }, 201);
};

exports.removeRole = async (req, res) => {
    const userId = req.params.user_id;
    const roleId = req.params.role_id;
    const actorId = req.user.user_id;
    await usersService.removeRole(userId, roleId, actorId);
    return successResponse(res, { message: 'Role removed successfully' });
};
