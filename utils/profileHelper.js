const db = require('../config/database');

class ProfileHelper {
    /**
     * Resolves a user_id to a specific profile ID (student_id or faculty_id)
     */
    async getProfileId(userId, role) {
        if (role === 'Student') {
            const [rows] = await db.execute(`SELECT student_id as id FROM students WHERE user_id = ?`, [userId]);
            return rows[0] ? rows[0].id : null;
        } else if (role === 'Faculty') {
            const [rows] = await db.execute(`SELECT faculty_id as id FROM faculty WHERE user_id = ?`, [userId]);
            return rows[0] ? rows[0].id : null;
        }
        return null;
    }

    /**
     * Checks if a user has access to a specific resource
     * @param {Object} userContext - req.user
     * @param {Object} resource - The database record
     * @param {String} ownerField - The field name in the record that identifies the owner
     */
    verifyOwnership(userContext, resource, ownerField) {
        if (userContext.role === 'Admin') return true;

        const profileId = userContext.profile_id; // We can attach this in middleware later
        if (resource[ownerField] !== profileId) {
            const error = new Error('Access denied: You do not own this resource');
            error.statusCode = 403;
            error.code = 'FORBIDDEN';
            throw error;
        }
        return true;
    }
}

module.exports = new ProfileHelper();
