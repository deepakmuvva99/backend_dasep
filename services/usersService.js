const bcrypt = require('bcrypt');
const usersModel = require('../models/usersModel');
const emailService = require('./emailService');

class UsersService {
    async createUser(data) {
        const existingUser = await usersModel.findByEmail(data.email);
        if (existingUser) {
            const error = new Error('User with this email already exists');
            error.statusCode = 409;
            error.code = 'CONFLICT';
            throw error;
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);
        const userId = await usersModel.createUser(data.name, data.email, hashedPassword);
        
        return { user_id: userId, name: data.name, email: data.email };
    }

    async getUsers(query, pagination, sorting) {
        const filters = {
            search: query.search || null,
            role: query.role || null,
            status: query.status || null
        };
        
        return await usersModel.findUsers(filters, pagination, sorting);
    }

    async getUserProfile(userId, requestId, requestRole) {
        // Enforce RBAC logically: Admin can see any; Others only see themselves
        if (requestRole !== 'Admin' && parseInt(userId) !== parseInt(requestId)) {
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

    async updateUser(userId, data) {
        const user = await usersModel.findById(userId);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }

        await usersModel.updateUser(userId, data);
        return { ...user, name: data.name, email: data.email };
    }

    async changePassword(userId, currentPassword, newPassword, requestId, requestRole) {
        // RBAC: Only self can change password (Admins can't even change others' passwords here for security)
        // If Admins should be able to reset, we'd add another method without currentPassword check.
        if (parseInt(userId) !== parseInt(requestId)) {
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

        // 4. Send notification email
        await emailService.sendPasswordChangeNotification(user);

        return true;
    }

    async deleteUser(userId) {
        const affectedRows = await usersModel.softDeleteUser(userId);
        if (affectedRows === 0) {
            const error = new Error('User not found or already deleted');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }
        return true;
    }

    // Role Assignments
    async getUserRoles(userId) {
        return await usersModel.getUserRoles(userId);
    }

    async assignRole(userId, data) {
        // Expected data.role_id array or single ID
        const roleId = data.role_id; 
        const success = await usersModel.assignRoleToUser(userId, roleId);
        if (!success) {
            const error = new Error('Role already assigned or invalid mapping');
            error.statusCode = 409;
            error.code = 'CONFLICT';
            throw error;
        }
        return true;
    }

    async removeRole(userId, roleId) {
        const success = await usersModel.removeRoleFromUser(userId, roleId);
        if (!success) {
            const error = new Error('Role not assigned or invalid mapping');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }
        return true;
    }
}

module.exports = new UsersService();
