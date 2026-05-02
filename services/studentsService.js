const bcrypt = require('bcrypt');
const crypto = require('crypto');
const studentsModel = require('../models/studentsModel');
const usersModel = require('../models/usersModel'); // Using cross-model logic
const emailService = require('./emailService');

class StudentsService {
    async createStudent(data, adminUserId) {
        // Validation for uniqueness
        const existingEmail = await usersModel.findByEmail(data.email);
        if (existingEmail) {
            const error = new Error('Email already in use');
            error.statusCode = 409;
            error.code = 'CONFLICT';
            throw error;
        }

        const existingInstId = await studentsModel.findByInstitutionId(data.institution_id);
        if (existingInstId) {
            const error = new Error('Institution ID already exists');
            error.statusCode = 409;
            error.code = 'CONFLICT';
            throw error;
        }

        // Generate auto temporary password
        const autoPassword = crypto.randomBytes(8).toString('hex');
        const passwordHash = await bcrypt.hash(autoPassword, 10);

        const ids = await studentsModel.createStudentWithTransaction(
            { name: data.name, email: data.email, password_hash: passwordHash },
            { institution_id: data.institution_id, class_id: data.class_id, created_by_user_id: adminUserId }
        );


        const result = { 
            student_id: ids.student_id, 
            user_id: ids.user_id, 
            name: data.name,
            initial_password: autoPassword // Emulate emailing the user by returning in response for demo purposes
        };

        // Send Email asynchronously
        emailService.sendWelcomeEmail({ name: data.name, email: data.email }, autoPassword, 'Student');

        return result;
    }

    async getStudents(query, pagination, sorting) {
        const filters = {
            search: query.search || null,
            class_id: query.class_id || null,
            is_active: query.is_active || null
        };
        return await studentsModel.getStudents(filters, pagination, sorting);
    }

    async getStudentProfile(studentId, userContext) {
        const student = await studentsModel.findById(studentId);
        if (!student) {
            const error = new Error('Student not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }

        // RBAC enforcement: A student can only view themselves
        if (userContext.role === 'Student' && parseInt(student.user_id) !== parseInt(userContext.user_id)) {
            const error = new Error('You do not have permission to view this profile');
            error.statusCode = 403;
            error.code = 'FORBIDDEN';
            throw error;
        }

        return student;
    }

    async updateStudent(studentId, data) {
        const student = await studentsModel.findById(studentId);
        if (!student) {
            const error = new Error('Student not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }

        // Checking constraint collision if modified
        if (data.institution_id !== student.institution_id) {
            const existing = await studentsModel.findByInstitutionId(data.institution_id);
            if (existing) {
                const error = new Error('Institution ID assigned to another student.');
                error.statusCode = 409;
                error.code = 'CONFLICT';
                throw error;
            }
        }

        await studentsModel.updateStudent(studentId, data);
        return { ...student, class_id: data.class_id, institution_id: data.institution_id };
    }

    async deleteStudent(studentId) {
        try {
            await studentsModel.deleteStudent(studentId);
        } catch (err) {
            const error = new Error('Student not found or already deleted');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }
        return true;
    }

    async setStudentStatus(studentId, isActive) {
        const affectedRows = await studentsModel.setStudentStatus(studentId, isActive);
        if (affectedRows === 0) {
            const error = new Error('Student not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }
        return true;
    }

    async getStudentSubmissions(studentId, pagination, userContext) {
        const student = await studentsModel.findById(studentId);
        if (!student) {
            const error = new Error('Student not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }

        if (userContext.role === 'Student' && parseInt(student.user_id) !== parseInt(userContext.user_id)) {
            const error = new Error('Permission denied');
            error.statusCode = 403;
            error.code = 'FORBIDDEN';
            throw error;
        }

        return await studentsModel.getStudentSubmissions(studentId, pagination);
    }
}

module.exports = new StudentsService();
