const bcrypt = require('bcrypt');
const crypto = require('node:crypto');
const facultyModel = require('../models/facultyModel');
const usersModel = require('../models/usersModel');
const emailService = require('./emailService');

class FacultyService {
    async createFaculty(data) {
        const existingEmail = await usersModel.findByEmail(data.email);
        if (existingEmail) {
            const error = new Error('Email already in use by another user');
            error.statusCode = 409;
            error.code = 'CONFLICT';
            throw error;
        }

        const passwordToHash = data.password || crypto.randomBytes(8).toString('hex');
        const passwordHash = await bcrypt.hash(passwordToHash, 10);

        const ids = await facultyModel.createFacultyWithTransaction(
            { name: data.name, email: data.email, password_hash: passwordHash },
            {},
        );

        const result = {
            faculty_id: ids.faculty_id,
            user_id: ids.user_id,
            name: data.name,
            initial_password: passwordToHash, // Should be emailed normally
        };

        // Send Email asynchronously
        emailService.sendWelcomeEmail({ name: data.name, email: data.email }, passwordToHash, 'Faculty');

        return result;
    }

    async getFaculty(query, pagination) {
        const filters = {
            search: query.search || null,
            is_active: query.is_active || null,
        };
        return await facultyModel.getFaculty(filters, pagination);
    }

    async getFacultyProfile(facultyId, userContext) {
        const faculty = await facultyModel.findById(facultyId);
        if (!faculty) {
            const error = new Error('Faculty member not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }

        if (
            userContext.role === 'Faculty' &&
            Number.parseInt(faculty.user_id) !== Number.parseInt(userContext.user_id)
        ) {
            const error = new Error('Permission denied');
            error.statusCode = 403;
            error.code = 'FORBIDDEN';
            throw error;
        }

        return faculty;
    }

    async updateFaculty(facultyId, data) {
        await this.getFacultyProfile(facultyId, { role: 'Admin' }); // existence check
        await facultyModel.updateFaculty(facultyId, data);
        return { faculty_id: facultyId, ...data };
    }

    async deleteFaculty(facultyId) {
        try {
            await facultyModel.deleteFaculty(facultyId);
        } catch (e) {
            console.error('Error deleting faculty:', e);
            const error = new Error('Faculty member not found or error deleting');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }
        return true;
    }

    async setFacultyStatus(facultyId, isActive) {
        const success = await facultyModel.setFacultyStatus(facultyId, isActive);
        if (!success) {
            const error = new Error('Faculty not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }
        return true;
    }

    async getFacultyAssignments(facultyId, pagination, userContext) {
        // Enforce RBAC
        await this.getFacultyProfile(facultyId, userContext);
        return await facultyModel.getFacultyAssignments(facultyId, pagination);
    }

    async getSubjectNamesLookup() {
        return await facultyModel.getSubjectNamesLookup();
    }

    async getFacultyLookup() {
        return await facultyModel.getFacultyLookup();
    }
}

module.exports = new FacultyService();
