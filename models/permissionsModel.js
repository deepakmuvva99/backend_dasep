const db = require('../config/database');

class PermissionsModel {
    async findAll(filters = {}, pagination = {}, sorting = { sort_by: 'permission_id', order: 'ASC' }) {
        let query = `SELECT permission_id, permission_id as id, name, description, created_at, updated_at FROM PERMISSIONS WHERE 1=1`;
        const params = [];

        if (filters.search) {
            query += ` AND (name LIKE ? OR description LIKE ?)`;
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        const countQuery = `SELECT COUNT(*) as total FROM (${query}) as sub`;
        const [countRows] = await db.execute(countQuery, params);
        const total = countRows[0].total;

        query += ` ORDER BY ${sorting.sort_by} ${sorting.order}`;

        if (pagination.limit && pagination.offset !== undefined) {
            query += ` LIMIT ? OFFSET ?`;
            params.push(pagination.limit, pagination.offset);
        }

        const [rows] = await db.query(query, params);
        return { rows, total };
    }

    async findById(permissionId) {
        const [rows] = await db.execute(
            `SELECT permission_id, permission_id as id, name, description, created_at, updated_at FROM PERMISSIONS WHERE permission_id = ?`,
            [permissionId]
        );
        return rows[0];
    }

    async findByName(name) {
        const [rows] = await db.execute(
            `SELECT permission_id, name, description FROM PERMISSIONS WHERE name = ?`,
            [name]
        );
        return rows[0];
    }

    async createPermission(name, description) {
        const [result] = await db.execute(
            `INSERT INTO PERMISSIONS (name, description, created_at, updated_at) VALUES (?, ?, NOW(), NOW())`,
            [name, description]
        );
        return result.insertId;
    }

    async updatePermission(permissionId, name, description) {
        const [result] = await db.execute(
            `UPDATE PERMISSIONS SET name = ?, description = ?, updated_at = NOW() WHERE permission_id = ?`,
            [name, description, permissionId]
        );
        return result.affectedRows;
    }

    async deletePermission(permissionId) {
        const [result] = await db.execute(
            `DELETE FROM PERMISSIONS WHERE permission_id = ?`,
            [permissionId]
        );
        return result.affectedRows;
    }
}

module.exports = new PermissionsModel();
