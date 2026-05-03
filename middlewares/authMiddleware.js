const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/responseHandler');

// Secret for JWT fallback if env not configured yet
const JWT_SECRET = process.env.JWT_SECRET || 'development_super_secret_temporary_key';

/**
 * Validate JWT stored in Bearer header.
 */
const db = require('../config/database');

const authModel = require('../models/authModel');

/**
 * Validates JWT and mounts decoded payload.
 */
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return errorResponse(res, 'UNAUTHORISED', 'Missing or invalid Authorization header.', 401);
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // CHECK BLACKLIST: Verify if this specific token (jti) has been blacklisted (logged out)
        if (decoded.jti) {
            const isBlacklisted = await authModel.isTokenBlacklisted(decoded.jti);
            if (isBlacklisted) {
                return errorResponse(res, 'UNAUTHORISED', 'This session has been logged out. Please login again.', 401);
            }
        }

        req.user = decoded;
        next();
    } catch (_error) {
        return errorResponse(res, 'UNAUTHORISED', 'Invalid or expired token.', 401);
    }
};

/**
 * Middleware to resolve the specific profile ID (student_id or faculty_id)
 * for the current user and attach it to req.user.profile_id.
 */
const resolveProfile = async (req, res, next) => {
    if (!req.user) return next();

    try {
        if (req.user.role === 'Student') {
            const [rows] = await db.execute(`SELECT student_id FROM students WHERE user_id = ?`, [req.user.user_id]);
            if (rows[0]) req.user.profile_id = rows[0].student_id;
        } else if (req.user.role === 'Faculty') {
            const [rows] = await db.execute(`SELECT faculty_id FROM faculty WHERE user_id = ?`, [req.user.user_id]);
            if (rows[0]) req.user.profile_id = rows[0].faculty_id;
        }
        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Higher Order Function to protect routes based on roles.
 */
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return errorResponse(res, 'FORBIDDEN', 'Access denied.', 403);
        }
        next();
    };
};

module.exports = { verifyToken, restrictTo, resolveProfile };
