const authService = require('../services/authService');
const { successResponse } = require('../utils/responseHandler');

exports.login = async (req, res) => {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
        return res
            .status(400)
            .json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing identifier or password' } });
    }

    const deviceInfo = JSON.stringify({ userAgent: req.headers['user-agent'] || 'Unknown' });

    const loginData = await authService.login(identifier, password, deviceInfo);

    return successResponse(res, loginData, 200);
};

exports.logout = async (req, res) => {
    const authHeader = req.headers.authorization;
    await authService.logout(authHeader);

    return successResponse(res, { message: 'Successfully logged out' }, 200);
};

exports.verifyToken = async (req, res) => {
    // If the middleware didn't throw, token is valid
    return successResponse(res, { valid: true, user: req.user }, 200);
};
