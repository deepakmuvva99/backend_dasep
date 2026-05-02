const db = require('../config/database');

class UsersModel {
    async createUser(name, email, passwordHash) {
        const [result] = await db.execute(
            `INSERT INTO USERS (name, email, password_hash, created_at) VALUES (?, ?, ?, NOW())`,
            [name, email, passwordHash]
        );
        return result.insertId;
    }

    async findUsers(filters, pagination, sorting) {
        let query = `
            SELECT u.user_id, u.user_id as id, u.name, u.email, u.created_at, u.deleted_at
            FROM USERS u
            WHERE u.deleted_at IS NULL
        `;
        const params = [];

        if (filters.search) {
            query += ` AND (u.name LIKE ? OR u.email LIKE ?)`;
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        // Add role filtering by joining USER_ROLES and ROLES
        if (filters.role) {
            query += ` AND u.user_id IN (
                SELECT ur.user_id FROM USER_ROLES ur 
                JOIN ROLES r ON ur.role_id = r.role_id 
                WHERE r.name = ?
            )`;
            params.push(filters.role); // e.g. 'Student', 'Faculty', 'Admin'
        }

        // Note: For actual 'status' filtering (active vs inactive), would need to join STUDENTS/FACULTY tables
        // but for now, we just rely on deleted_at being NULL.

        // Count query for pagination
        const countQuery = `SELECT COUNT(*) as total FROM (${query}) as sub`;
        const [countRows] = await db.execute(countQuery, params);
        const total = countRows[0].total;

        // Apply sorting and pagination
        query += ` ORDER BY ${sorting.sort_by} ${sorting.order}`;
        query += ` LIMIT ? OFFSET ?`;
        params.push(pagination.limit, pagination.offset);

        // We use db.query instead of db.execute due to an issue with limit/offset escaping in mysql2
        const [rows] = await db.query(query, params);

        return { rows, total };
    }

    async findById(userId) {
        const [rows] = await db.execute(
            `SELECT user_id, user_id as id, name, email, created_at FROM USERS WHERE user_id = ? AND deleted_at IS NULL`,
            [userId]
        );
        return rows[0];
    }

    async findWithPasswordById(userId) {
        const [rows] = await db.execute(
            `SELECT user_id, name, email, password_hash FROM USERS WHERE user_id = ? AND deleted_at IS NULL`,
            [userId]
        );
        return rows[0];
    }

    async findByEmail(email) {
        const [rows] = await db.execute(
            `SELECT * FROM USERS WHERE email = ? AND deleted_at IS NULL`,
            [email]
        );
        return rows[0];
    }

    async updateUser(userId, data) {
        const [result] = await db.execute(
            `UPDATE USERS SET name = ?, email = ? WHERE user_id = ?`,
            [data.name, data.email, userId]
        );
        return result.affectedRows;
    }

    async updatePassword(userId, passwordHash) {
        const [result] = await db.execute(
            `UPDATE USERS SET password_hash = ? WHERE user_id = ?`,
            [passwordHash, userId]
        );
        return result.affectedRows;
    }

    async softDeleteUser(userId) {
        const [result] = await db.execute(
            `UPDATE USERS SET deleted_at = NOW() WHERE user_id = ?`,
            [userId]
        );
        return result.affectedRows;
    }

    async getUserRoles(userId) {
        const [rows] = await db.execute(
            `SELECT r.role_id, r.name 
             FROM ROLES r 
             JOIN USER_ROLES ur ON r.role_id = ur.role_id 
             WHERE ur.user_id = ?`,
            [userId]
        );
        return rows;
    }

    async assignRoleToUser(userId, roleId) {
        const [result] = await db.execute(
            `INSERT IGNORE INTO USER_ROLES (user_id, role_id) VALUES (?, ?)`,
            [userId, roleId]
        );
        return result.affectedRows > 0;
    }

    async removeRoleFromUser(userId, roleId) {
        const [result] = await db.execute(
            `DELETE FROM USER_ROLES WHERE user_id = ? AND role_id = ?`,
            [userId, roleId]
        );
        return result.affectedRows > 0;
    }
}

module.exports = new UsersModel();
