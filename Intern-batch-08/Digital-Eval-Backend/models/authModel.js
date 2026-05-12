const db = require('../config/database');

class AuthModel {
    async findUserByEmailOrIdentifier(identifier) {
        // Find user by email. We assume identifier usually falls back to email.
        // If institution_id or faculty_id is passed, we would need to join STUDENTS/FACULTY.
        // For simplicity based on standard schemas, we fall back to checking if it's an email format.
        const [rows] = await db.execute(
            `SELECT user_id, name, email, password_hash 
             FROM users 
             WHERE email = ? AND deleted_at IS NULL`,
            [identifier],
        );

        if (rows.length > 0) return rows[0];

        // Also check if it's a student ID
        const [studentRows] = await db.execute(
            `SELECT u.user_id, u.name, u.email, u.password_hash 
             FROM students s
             JOIN users u ON s.user_id = u.user_id
             WHERE s.institution_id = ? AND u.deleted_at IS NULL AND s.deleted_at IS NULL`,
            [identifier],
        );

        if (studentRows.length > 0) return studentRows[0];

        return null;
    }

    async getHighestRole(userId) {
        const [rows] = await db.execute(
            `SELECT r.name as role_name 
             FROM user_roles ur
             JOIN roles r ON ur.role_id = r.role_id
             WHERE ur.user_id = ?
             ORDER BY r.role_id ASC LIMIT 1`, // Assuming Admin < Faculty < Student role_id or just arbitrary sort. Real systems map explicitly.
            [userId],
        );
        return rows[0] ? rows[0].role_name : 'Student';
    }

    async createSession(userId, tokenHash, deviceInfo) {
        const [result] = await db.execute(
            `INSERT INTO user_sessions (user_id, session_token_hash, device_info, is_active, created_at, last_active_at)
             VALUES (?, ?, ?, 1, NOW(), NOW())`,
            [userId, tokenHash, deviceInfo],
        );
        return result.insertId;
    }

    async disableOtherSessions(userId) {
        await db.execute(`UPDATE user_sessions SET is_active = 0 WHERE user_id = ?`, [userId]);
    }

    async blacklistToken(jti, userId, expiresAt) {
        await db.execute(
            `INSERT INTO token_blacklist (jti, user_id, expires_at, blacklisted_at)
             VALUES (?, ?, ?, NOW())`,
            [jti, userId, expiresAt],
        );
    }

    async isTokenBlacklisted(jti) {
        const [rows] = await db.execute(`SELECT token_blacklist_id FROM token_blacklist WHERE jti = ?`, [jti]);
        return rows.length > 0;
    }

    async isSessionActive(tokenHash) {
        const [rows] = await db.execute(
            `SELECT session_id FROM user_sessions 
             WHERE session_token_hash = ? AND is_active = 1`,
            [tokenHash],
        );
        return rows.length > 0;
    }
}

module.exports = new AuthModel();
