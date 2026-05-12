const bcrypt = require('bcrypt');
const crypto = require('node:crypto');
const studentsModel = require('../models/studentsModel');
const usersModel = require('../models/usersModel'); // Using cross-model logic
const facultyModel = require('../models/facultyModel');
const emailService = require('./emailService');
const auditLogsService = require('./auditLogsService');

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

        // Generate auto temporary password or use provided one
        const passwordToHash = data.password || crypto.randomBytes(8).toString('hex');
        const passwordHash = await bcrypt.hash(passwordToHash, 10);

        const ids = await studentsModel.createStudentWithTransaction(
            { name: data.name, email: data.email, password_hash: passwordHash },
            { institution_id: data.institution_id, class_id: data.class_id, created_by_user_id: adminUserId },
        );

        await auditLogsService.logAction({
            entity_type: 'students',
            entity_id: ids.student_id,
            field_name: 'all',
            old_value: null,
            new_value: JSON.stringify({ institution_id: data.institution_id, class_id: data.class_id }),
            changed_by_user_id: adminUserId,
        });

        const result = {
            student_id: ids.student_id,
            user_id: ids.user_id,
            name: data.name,
            initial_password: passwordToHash, // Emulate emailing the user by returning in response for demo purposes
        };

        // Send Email asynchronously
        emailService.sendWelcomeEmail({ name: data.name, email: data.email }, passwordToHash, 'Student');

        return result;
    }

    async getStudents(query, pagination, sorting) {
        const filters = {
            search: query.search || null,
            class_id: query.class_id || null,
            is_active: query.is_active || null,
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
        if (
            userContext.role === 'Student' &&
            Number.parseInt(student.user_id) !== Number.parseInt(userContext.user_id)
        ) {
            const error = new Error('You do not have permission to view this profile');
            error.statusCode = 403;
            error.code = 'FORBIDDEN';
            throw error;
        }

        // RBAC enforcement: A faculty can only view students in their assigned classes
        if (userContext.role === 'Faculty') {
            const assigned = await facultyModel.isAssignedToClass(userContext.profile_id, student.class_id);
            if (!assigned) {
                const error = new Error('You do not have permission to view this student profile.');
                error.statusCode = 403;
                error.code = 'FORBIDDEN';
                throw error;
            }
        }

        return student;
    }

    async updateStudent(studentId, data, actorId) {
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

        await auditLogsService.logAction({
            entity_type: 'students',
            entity_id: studentId,
            field_name: 'all',
            old_value: JSON.stringify({ class_id: student.class_id, institution_id: student.institution_id }),
            new_value: JSON.stringify({ class_id: data.class_id, institution_id: data.institution_id }),
            changed_by_user_id: actorId,
        });

        return { ...student, class_id: data.class_id, institution_id: data.institution_id };
    }

    async deleteStudent(studentId, actorId) {
        const student = await studentsModel.findById(studentId);
        try {
            await studentsModel.deleteStudent(studentId);

            await auditLogsService.logAction({
                entity_type: 'students',
                entity_id: studentId,
                field_name: 'all',
                old_value: JSON.stringify(student),
                new_value: 'SOFT_DELETED',
                changed_by_user_id: actorId,
            });
        } catch (err) {
            console.error('Error deleting student:', err);
            const error = new Error('Student not found or already deleted');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }
        return true;
    }

    async setStudentStatus(studentId, isActive, actorId) {
        const student = await studentsModel.findById(studentId);
        const affectedRows = await studentsModel.setStudentStatus(studentId, isActive);
        if (affectedRows === 0) {
            const error = new Error('Student not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }

        await auditLogsService.logAction({
            entity_type: 'students',
            entity_id: studentId,
            field_name: 'is_active',
            old_value: String(student.is_active),
            new_value: String(isActive),
            changed_by_user_id: actorId,
        });

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

        if (
            userContext.role === 'Student' &&
            Number.parseInt(student.user_id) !== Number.parseInt(userContext.user_id)
        ) {
            const error = new Error('Permission denied');
            error.statusCode = 403;
            error.code = 'FORBIDDEN';
            throw error;
        }

        return await studentsModel.getStudentSubmissions(studentId, pagination);
    }
}

module.exports = new StudentsService();
