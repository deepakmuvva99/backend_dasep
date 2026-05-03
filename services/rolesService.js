const rolesModel = require('../models/rolesModel');

class RolesService {
    async createRole(name) {
        const existing = await rolesModel.findByName(name);
        if (existing) {
            const error = new Error('Role name already exists');
            error.statusCode = 409;
            error.code = 'CONFLICT';
            throw error;
        }

        const roleId = await rolesModel.createRole(name);
        return { role_id: roleId, name: name };
    }

    async getRoles(query, pagination) {
        const search = query.search || null;
        return await rolesModel.getRoles(pagination, search);
    }

    async updateRole(roleId, name) {
        const existing = await rolesModel.findById(roleId);
        if (!existing) {
            const error = new Error('Role not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }

        if (name !== existing.name) {
            const collision = await rolesModel.findByName(name);
            if (collision) {
                const error = new Error('Role name already in use');
                error.statusCode = 409;
                error.code = 'CONFLICT';
                throw error;
            }
        }

        await rolesModel.updateRole(roleId, name);
        return { role_id: roleId, name: name };
    }

    async deleteRole(roleId) {
        // Validation ensuring role exists
        const existing = await rolesModel.findById(roleId);
        if (!existing) {
            const error = new Error('Role not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }

        await rolesModel.deleteRole(roleId);
        return true;
    }

    async getRolePermissions(roleId) {
        return await rolesModel.getRolePermissions(roleId);
    }

    async assignPermission(roleId, permissionId) {
        const success = await rolesModel.addPermissionToRole(roleId, permissionId);
        if (!success) {
            const error = new Error('Permission already assigned or invalid');
            error.statusCode = 409;
            error.code = 'CONFLICT';
            throw error;
        }
        return true;
    }

    async removePermission(roleId, permissionId) {
        const success = await rolesModel.removePermissionFromRole(roleId, permissionId);
        if (!success) {
            const error = new Error('Permission mapping not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }
        return true;
    }
}

module.exports = new RolesService();
