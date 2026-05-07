const classesModel = require('../models/classesModel');
const studentsModel = require('../models/studentsModel');
const facultyModel = require('../models/facultyModel');
const subjectsModel = require('../models/subjectsModel');
const notificationsService = require('./notificationsService');

class ClassesService {
    async createClass(data) {
        const existing = await classesModel.findByCombo(data.grade, data.section, data.academic_year);
        if (existing) {
            const error = new Error('Class combination already exists');
            error.statusCode = 409;
            error.code = 'CONFLICT';
            throw error;
        }

        const classId = await classesModel.createClass(data);
        return { class_id: classId, ...data };
    }

    async getClasses(query, pagination, sorting) {
        const filters = {
            grade: query.grade || null,
            academic_year: query.academic_year || null,
            search: query.search || null,
        };
        return await classesModel.getClasses(filters, pagination, sorting);
    }

    async getClassDetails(classId) {
        const c = await classesModel.findById(classId);
        if (!c) {
            const error = new Error('Class not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }
        return c;
    }

    async updateClass(classId, data) {
        const existing = await classesModel.findById(classId);
        if (!existing) {
            const error = new Error('Class not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }

        const collision = await classesModel.findByCombo(data.grade, data.section, data.academic_year);
        if (collision && collision.class_id !== Number.parseInt(classId)) {
            const error = new Error('Another class exists with this grade, section, and year');
            error.statusCode = 409;
            error.code = 'CONFLICT';
            throw error;
        }

        await classesModel.updateClass(classId, data);
        return { class_id: classId, ...data };
    }

    async deleteClass(classId) {
        // Could add validation if it has students -> disallow delete
        // Implementing simple cascade for the moment
        try {
            await classesModel.deleteClass(classId);
        } catch (e) {
            console.error('Error deleting class:', e);
            const error = new Error('Cannot delete class, it may be associated with students constraints');
            error.statusCode = 400;
            error.code = 'BAD_REQUEST';
            throw error;
        }
        return true;
    }

    async getClassSubjects(classId, pagination) {
        // Exists check
        await this.getClassDetails(classId);
        return await classesModel.getClassSubjects(classId, pagination);
    }

    async getClassesLookup() {
        return await classesModel.getLookup();
    }

    async addClassSubject(classId, subjectId) {
        // 1. Verify class exists
        const classDetails = await this.getClassDetails(classId);
        const subjectDetails = await subjectsModel.findById(subjectId);

        // 2. Check for duplicate link
        const existing = await classesModel.findClassSubject(classId, subjectId);
        if (existing) {
            return true; // Already linked, skip instead of error for batch processing
        }

        await classesModel.addClassSubject(classId, subjectId);

        // 3. Trigger Notifications
        // A. Notify all students in this class
        const studentUserIds = await studentsModel.findUserIdsByClass(classId);
        for (const uid of studentUserIds) {
            await notificationsService.createNotification({
                user_id: uid,
                entity_type: 'classes',
                entity_id: classId,
                message: `The subject "${subjectDetails.name}" has been added to your class (Grade ${classDetails.grade}-${classDetails.section}).`,
            });
        }

        // B. Notify assigned faculty
        const facultyUserIds = await facultyModel.findUserIdsBySubjectAndClass(subjectId, classId);
        for (const fuid of facultyUserIds) {
            await notificationsService.createNotification({
                user_id: fuid,
                entity_type: 'subjects',
                entity_id: subjectId,
                message: `You have been assigned to Grade ${classDetails.grade}-${classDetails.section} for the subject "${subjectDetails.name}".`,
            });
        }

        return true;
    }

    async removeClassSubject(classId, subjectId) {
        return await classesModel.removeClassSubject(classId, subjectId);
    }

    async getClassStudents(classId, pagination, userContext) {
        // 1. Verify class exists
        await this.getClassDetails(classId);

        // 2. Access control for Faculty
        if (userContext.role === 'Faculty') {
            const assigned = await facultyModel.isAssignedToClass(userContext.profile_id, classId);
            if (!assigned) {
                const error = new Error('You are not assigned to this class.');
                error.statusCode = 403;
                error.code = 'FORBIDDEN';
                throw error;
            }
        }

        const filters = { class_id: classId };
        // Default sorting for student list within a class
        const sorting = { sort_by: 'name', order: 'ASC' };

        return await studentsModel.getStudents(filters, pagination, sorting);
    }
}

module.exports = new ClassesService();
