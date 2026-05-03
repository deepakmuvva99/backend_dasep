const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('node:crypto');
const authModel = require('../models/authModel');

const JWT_SECRET = process.env.JWT_SECRET || 'development_super_secret_temporary_key';

class AuthService {
    async login(identifier, password, deviceInfo) {
        // 1. Resolve User
        const user = await authModel.findUserByEmailOrIdentifier(identifier);
        if (!user) {
            const error = new Error('Invalid identifier or password');
            error.statusCode = 401;
            error.code = 'INVALID_CREDENTIALS';
            throw error;
        }

        // 2. Verify Password
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            const error = new Error('Invalid identifier or password');
            error.statusCode = 401;
            error.code = 'INVALID_CREDENTIALS';
            throw error;
        }

        // 3. Resolve Primary Role
        const primaryRole = await authModel.getHighestRole(user.user_id);

        // 4. Generate JWT
        const jti = crypto.randomUUID();
        const payload = {
            user_id: user.user_id,
            role: primaryRole,
            jti: jti,
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

        // 5. Manage Sessions (Enforce Single Session)
        await authModel.disableOtherSessions(user.user_id);
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        await authModel.createSession(user.user_id, tokenHash, deviceInfo);

        return {
            token: token,
            token_type: 'Bearer',
            expires_in: 28800,
            user: {
                user_id: user.user_id,
                name: user.name,
                role: primaryRole,
            },
        };
    }

    async logout(token) {
        if (!token) return false;
        const pureToken = token.replace('Bearer ', '');
        try {
            const decoded = jwt.decode(pureToken);
            if (decoded?.jti) {
                const expiresAt = new Date(decoded.exp * 1000);
                await authModel.blacklistToken(decoded.jti, decoded.user_id, expiresAt);
                await authModel.disableOtherSessions(decoded.user_id);
            }
        } catch (err) {
            console.error('Logout error:', err);
            return false;
        }
        return true;
    }
}

module.exports = new AuthService();
