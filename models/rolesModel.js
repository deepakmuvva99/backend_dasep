const db = require('../config/database');

class RolesModel {
    async createRole(name) {
        const [result] = await db.execute(
            `INSERT INTO ROLES (name) VALUES (?)`,
            [name]
        );
        return result.insertId;
    }

    async getRoles(pagination, search) {
        let query = `SELECT *, role_id as id FROM ROLES`;
        const params = [];

        if (search) {
            query += ` WHERE name LIKE ?`;
            params.push(`%${search}%`);
        }

        const countQuery = `SELECT COUNT(*) as total FROM (${query}) as sub`;
        const [countRows] = await db.execute(countQuery, params);
        const total = countRows[0].total;

        query += ` ORDER BY role_id ASC LIMIT ? OFFSET ?`;
        params.push(pagination.limit, pagination.offset);

        const [rows] = await db.query(query, params);
        return { rows, total };
    }

    async findById(roleId) {
        const [rows] = await db.execute(`SELECT *, role_id as id FROM ROLES WHERE role_id = ?`, [roleId]);
        return rows[0];
    }

    async findByName(name) {
        const [rows] = await db.execute(`SELECT * FROM ROLES WHERE name = ?`, [name]);
        return rows[0];
    }

    async updateRole(roleId, name) {
        const [result] = await db.execute(
            `UPDATE ROLES SET name = ? WHERE role_id = ?`,
            [name, roleId]
        );
        return result.affectedRows;
    }

    async deleteRole(roleId) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            // Cascades deletes using transactions since constraints might exist
            await connection.execute(`DELETE FROM ROLE_PERMISSIONS WHERE role_id = ?`, [roleId]);
            await connection.execute(`DELETE FROM USER_ROLES WHERE role_id = ?`, [roleId]);
            await connection.execute(`DELETE FROM ROLES WHERE role_id = ?`, [roleId]);

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async getRolePermissions(roleId) {
        const [rows] = await db.execute(
            `SELECT p.permission_id, p.name 
             FROM PERMISSIONS p
             JOIN ROLE_PERMISSIONS rp ON p.permission_id = rp.permission_id
             WHERE rp.role_id = ?`,
            [roleId]
        );
        return rows;
    }

    async addPermissionToRole(roleId, permissionId) {
        const [result] = await db.execute(
            `INSERT IGNORE INTO ROLE_PERMISSIONS (role_id, permission_id) VALUES (?, ?)`,
            [roleId, permissionId]
        );
        return result.affectedRows > 0;
    }

    async removePermissionFromRole(roleId, permissionId) {
        const [result] = await db.execute(
            `DELETE FROM ROLE_PERMISSIONS WHERE role_id = ? AND permission_id = ?`,
            [roleId, permissionId]
        );
        return result.affectedRows > 0;
    }
}

module.exports = new RolesModel();
