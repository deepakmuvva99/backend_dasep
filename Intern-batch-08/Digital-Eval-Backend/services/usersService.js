const bcrypt = require('bcrypt');
const usersModel = require('../models/usersModel');
const emailService = require('./emailService');
const auditLogsService = require('./auditLogsService');

class UsersService {
    async createUser(data, actorId) {
        const existingUser = await usersModel.findByEmail(data.email);
        if (existingUser) {
            const error = new Error('User with this email already exists');
            error.statusCode = 409;
            error.code = 'CONFLICT';
            throw error;
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        const userId = await usersModel.createUser(data.name, data.email, hashedPassword);

        if (data.role_id) {
            await usersModel.assignRoleToUser(userId, data.role_id);
        }

        await auditLogsService.logAction({
            entity_type: 'users',
            entity_id: userId,
            field_name: 'all',
            old_value: null,
            new_value: JSON.stringify({ name: data.name, email: data.email, role_id: data.role_id }),
            changed_by_user_id: actorId || userId, 
        });

        return { user_id: userId, name: data.name, email: data.email, role_id: data.role_id };
    }

    async getUsers(query, pagination, sorting) {
        const filters = {
            search: query.search || null,
            role: query.role || null,
            status: query.status || null,
        };

        return await usersModel.findUsers(filters, pagination, sorting);
    }

    async getUserProfile(userId, requestId, requestRole) {
        // Enforce RBAC logically: Admin can see any; Others only see themselves
        if (requestRole !== 'Admin' && Number.parseInt(userId) !== Number.parseInt(requestId)) {
            const error = new Error('Access denied to other user profiles');
            error.statusCode = 403;
            error.code = 'FORBIDDEN';
            throw error;
        }

        const user = await usersModel.findById(userId);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }

        return user;
    }

    async updateUser(userId, data, actorId) {
        const user = await usersModel.findById(userId);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }

        await usersModel.updateUser(userId, data);

        await auditLogsService.logAction({
            entity_type: 'users',
            entity_id: userId,
            field_name: 'all',
            old_value: JSON.stringify({ name: user.name, email: user.email }),
            new_value: JSON.stringify({ name: data.name, email: data.email }),
            changed_by_user_id: actorId,
        });

        return { ...user, name: data.name, email: data.email };
    }

    async changePassword(userId, currentPassword, newPassword, requestId, _requestRole) {
        // RBAC: Only self can change password (Admins can't even change others' passwords here for security)
        // If Admins should be able to reset, we'd add another method without currentPassword check.
        if (Number.parseInt(userId) !== Number.parseInt(requestId)) {
            const error = new Error('You can only change your own password');
            error.statusCode = 403;
            error.code = 'FORBIDDEN';
            throw error;
        }

        const user = await usersModel.findWithPasswordById(userId);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }

        // 1. Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            const error = new Error('Current password is incorrect');
            error.statusCode = 401;
            error.code = 'INVALID_CREDENTIALS';
            throw error;
        }

        // 2. Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // 3. Update database
        await usersModel.updatePassword(userId, hashedNewPassword);

        // Audit Log (Security)
        await auditLogsService.logAction({
            entity_type: 'users',
            entity_id: userId,
            field_name: 'password',
            old_value: 'HIDDEN',
            new_value: 'UPDATED',
            changed_by_user_id: requestId,
        });

        // 4. Send notification email
        await emailService.sendPasswordChangeNotification(user);

        return true;
    }

    async deleteUser(userId, actorId) {
        const user = await usersModel.findById(userId);
        const affectedRows = await usersModel.softDeleteUser(userId);
        if (affectedRows === 0) {
            const error = new Error('User not found or already deleted');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }

        await auditLogsService.logAction({
            entity_type: 'users',
            entity_id: userId,
            field_name: 'all',
            old_value: JSON.stringify(user),
            new_value: 'SOFT_DELETED',
            changed_by_user_id: actorId,
        });

        return true;
    }

    // Role Assignments
    async getUserRoles(userId) {
        return await usersModel.getUserRoles(userId);
    }

    async assignRole(userId, data, actorId) {
        // Expected data.role_id array or single ID
        const roleId = data.role_id;
        const success = await usersModel.assignRoleToUser(userId, roleId);
        if (!success) {
            const error = new Error('Role already assigned or invalid mapping');
            error.statusCode = 409;
            error.code = 'CONFLICT';
            throw error;
        }

        await auditLogsService.logAction({
            entity_type: 'user_roles',
            entity_id: userId,
            field_name: 'role_id',
            old_value: 'N/A',
            new_value: String(roleId),
            changed_by_user_id: actorId,
        });

        return true;
    }

    async removeRole(userId, roleId, actorId) {
        const success = await usersModel.removeRoleFromUser(userId, roleId);
        if (!success) {
            const error = new Error('Role not assigned or invalid mapping');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }

        await auditLogsService.logAction({
            entity_type: 'user_roles',
            entity_id: userId,
            field_name: 'role_id',
            old_value: String(roleId),
            new_value: 'REMOVED',
            changed_by_user_id: actorId,
        });

        return true;
    }
}

module.exports = new UsersService();
