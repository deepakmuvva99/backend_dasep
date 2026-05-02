const subjectsModel = require('../models/subjectsModel');

class SubjectsService {
    async createSubject(data) {
        const existingSubject = await subjectsModel.findByCode(data.code);
        if (existingSubject) {
            const error = new Error('Subject code already exists');
            error.statusCode = 409;
            error.code = 'CONFLICT';
            throw error;
        }

        const subjectId = await subjectsModel.createSubject(data.name, data.code);
        return { subject_id: subjectId, name: data.name, code: data.code };
    }

    async getSubjects(query, pagination, sorting, userContext) {
        // userContext = { user_id, role }
        const filters = {
            search: query.search || null,
            class_id: query.class_id || null
        };
        
        return await subjectsModel.getSubjects(filters, pagination, sorting, userContext);
    }

    async getSubjectDetails(subjectId, userContext) {
        // Ideally checking assignment rules if Faculty, but simplified for single read capability.
        // Usually Faculty can't view details for a subject they don't teach. Admin can view all.
        // A thorough access check logic can reside here.
        const subject = await subjectsModel.findById(subjectId);
        if (!subject) {
            const error = new Error('Subject not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }

        return subject;
    }

    async updateSubject(subjectId, data) {
        const existingSubject = await subjectsModel.findById(subjectId);
        if (!existingSubject) {
            const error = new Error('Subject not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }

        // Verify new code uniqueness if altered
        if (data.code !== existingSubject.code) {
            const collision = await subjectsModel.findByCode(data.code);
            if (collision) {
                const error = new Error('Subject code already assigned to another subject');
                error.statusCode = 409;
                error.code = 'CONFLICT';
                throw error;
            }
        }

        await subjectsModel.updateSubject(subjectId, data);
        return { ...existingSubject, name: data.name, code: data.code };
    }

    async deleteSubject(subjectId) {
        const affectedRows = await subjectsModel.deleteSubject(subjectId);
        if (affectedRows === 0) {
            const error = new Error('Subject not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }
        return true;
    }

    async getSubjectsLookup() {
        return await subjectsModel.getLookup();
    }
}

module.exports = new SubjectsService();
