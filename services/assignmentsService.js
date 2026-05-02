const assignmentsModel = require('../models/assignmentsModel');

class AssignmentsService {
    async createAssignment(data) {
        // Prevent duplicate assigning the exact same faculty to the same subject for the same class
        const existing = await assignmentsModel.findExactDuplicate(data.faculty_id, data.subject_id, data.class_id);
        if (existing) {
            const error = new Error('Faculty is already assigned to this class and subject');
            error.statusCode = 409;
            error.code = 'CONFLICT';
            throw error;
        }

        const assignmentId = await assignmentsModel.createAssignment(data.faculty_id, data.subject_id, data.class_id);
        return { assignment_id: assignmentId, ...data };
    }

    async getAssignments(query, pagination, sorting) {
        const filters = {
            faculty_id: query.faculty_id || null,
            subject_id: query.subject_id || null,
            class_id: query.class_id || null
        };
        return await assignmentsModel.getAssignments(filters, pagination, sorting);
    }

    async getAssignmentDetails(assignmentId) {
        const details = await assignmentsModel.findById(assignmentId);
        if (!details) {
            const error = new Error('Assignment not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }
        return details;
    }

    async updateAssignment(assignmentId, data) {
        const existing = await assignmentsModel.findById(assignmentId);
        if (!existing) {
            const error = new Error('Assignment not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }

        const exact = await assignmentsModel.findExactDuplicate(data.faculty_id, data.subject_id, data.class_id);
        if (exact && exact.assignment_id !== parseInt(assignmentId)) {
            const error = new Error('Faculty is already assigned to this class and subject in another record');
            error.statusCode = 409;
            error.code = 'CONFLICT';
            throw error;
        }

        await assignmentsModel.updateAssignment(assignmentId, data);
        return { assignment_id: assignmentId, ...data };
    }

    async deleteAssignment(assignmentId) {
        const affectedRows = await assignmentsModel.deleteAssignment(assignmentId);
        if (affectedRows === 0) {
            const error = new Error('Assignment not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }
        return true;
    }
}

module.exports = new AssignmentsService();
