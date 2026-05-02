const classesModel = require('../models/classesModel');

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
            search: query.search || null
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
        if (collision && collision.class_id !== parseInt(classId)) {
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
}

module.exports = new ClassesService();
