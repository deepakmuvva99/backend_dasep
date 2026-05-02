const permissionsModel = require('../models/permissionsModel');

class PermissionsService {
    async getAllPermissions(filters, pagination, sorting) {
        return await permissionsModel.findAll(filters, pagination, sorting);
    }

    async getPermissionById(permissionId) {
        const permission = await permissionsModel.findById(permissionId);
        if (!permission) {
            throw new Error('Permission not found');
        }
        return permission;
    }

    async createPermission(data) {
        const existing = await permissionsModel.findByName(data.name);
        if (existing) {
            throw new Error('Permission with this name already exists');
        }
        const insertId = await permissionsModel.createPermission(data.name, data.description);
        return await permissionsModel.findById(insertId);
    }

    async updatePermission(permissionId, data) {
        const existing = await permissionsModel.findById(permissionId);
        if (!existing) {
            throw new Error('Permission not found');
        }
        
        if (data.name && data.name !== existing.name) {
            const duplicate = await permissionsModel.findByName(data.name);
            if (duplicate) {
                throw new Error('Another permission with this name already exists');
            }
        }

        const newName = data.name || existing.name;
        const newDescription = data.description || existing.description;

        await permissionsModel.updatePermission(permissionId, newName, newDescription);
        return await permissionsModel.findById(permissionId);
    }

    async deletePermission(permissionId) {
        const existing = await permissionsModel.findById(permissionId);
        if (!existing) {
            throw new Error('Permission not found');
        }
        await permissionsModel.deletePermission(permissionId);
        return true;
    }
}

module.exports = new PermissionsService();
