const db = require('../config/database');

class PermissionsModel {
    async findAll(filtersArg = null, paginationArg = null, sortingArg = null) {
        const filters = filtersArg || {};
        const pagination = paginationArg || {};
        const sorting = sortingArg || { sort_by: 'permission_id', order: 'ASC' };
        let query = `SELECT permission_id, permission_id as id, name, description, created_at, updated_at FROM permissions WHERE 1=1`;
        const params = [];

        if (filters.search) {
            query += ` AND (name LIKE ? OR description LIKE ?)`;
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        const countQuery = `SELECT COUNT(*) as total FROM (${query}) as sub`;
        const [countRows] = await db.execute(countQuery, params);
        const total = countRows[0].total;

        // Explicit mapping to prevent SQL Injection
        const sortColumnMap = {
            permission_id: 'permission_id',
            name: 'name',
            created_at: 'created_at',
        };
        const sortColumn = sortColumnMap[sorting.sort_by] || 'permission_id';
        const sortOrder = sorting.order && sorting.order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        query += ` ORDER BY ${sortColumn} ${sortOrder}`;

        if (pagination.limit && pagination.offset !== undefined) {
            query += ` LIMIT ? OFFSET ?`;
            params.push(pagination.limit, pagination.offset);
        }

        const [rows] = await db.query(query, params);
        return { rows, total };
    }

    async findById(permissionId) {
        const [rows] = await db.execute(
            `SELECT permission_id, permission_id as id, name, description, created_at, updated_at FROM permissions WHERE permission_id = ?`,
            [permissionId],
        );
        return rows[0];
    }

    async findByName(name) {
        const [rows] = await db.execute(`SELECT permission_id, name, description FROM permissions WHERE name = ?`, [
            name,
        ]);
        return rows[0];
    }

    async createPermission(name, description) {
        const [result] = await db.execute(
            `INSERT INTO permissions (name, description, created_at, updated_at) VALUES (?, ?, NOW(), NOW())`,
            [name, description],
        );
        return result.insertId;
    }

    async updatePermission(permissionId, name, description) {
        const [result] = await db.execute(
            `UPDATE permissions SET name = ?, description = ?, updated_at = NOW() WHERE permission_id = ?`,
            [name, description, permissionId],
        );
        return result.affectedRows;
    }

    async deletePermission(permissionId) {
        const [result] = await db.execute(`DELETE FROM permissions WHERE permission_id = ?`, [permissionId]);
        return result.affectedRows;
    }
}

module.exports = new PermissionsModel();
