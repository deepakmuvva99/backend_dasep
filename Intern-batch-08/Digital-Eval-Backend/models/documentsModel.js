const db = require('../config/database');

class DocumentsModel {
    async createDocument(data) {
        const [result] = await db.execute(
            `INSERT INTO documents (submission_id, title, created_at)
             VALUES (?, ?, NOW())`,
            [data.submission_id, data.title],
        );
        return result.insertId;
    }

    async getDocuments(filters, pagination, sorting) {
        let query = `
            SELECT d.*, s.student_id, u.name as student_name
            FROM documents d
            JOIN submissions sub ON d.submission_id = sub.submission_id
            JOIN students s ON sub.student_id = s.student_id
            JOIN users u ON s.user_id = u.user_id
            WHERE d.deleted_at IS NULL
        `;
        const params = [];

        if (filters.submission_id) {
            query += ` AND d.submission_id = ?`;
            params.push(filters.submission_id);
        }

        const [countRows] = await db.execute(`SELECT COUNT(*) as total FROM (${query}) as subq`, params);
        const total = countRows[0].total;

        // Explicit mapping to prevent SQL Injection
        const sortColumnMap = {
            title: 'd.title',
            created_at: 'd.created_at',
            document_id: 'd.document_id',
        };
        const sortColumn = sortColumnMap[sorting.sort_by] || 'd.created_at';
        const sortOrder = sorting.order && sorting.order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        query += ` ORDER BY ${sortColumn} ${sortOrder} LIMIT ? OFFSET ?`;
        params.push(pagination.limit, pagination.offset);

        const [rows] = await db.execute(query, params);
        return { rows, total };
    }

    async getBySubmissionId(submissionId) {
        const [rows] = await db.execute(`SELECT * FROM documents WHERE submission_id = ? AND deleted_at IS NULL`, [
            submissionId,
        ]);
        return rows;
    }

    async findById(documentId) {
        const [rows] = await db.execute(`SELECT * FROM documents WHERE document_id = ? AND deleted_at IS NULL`, [
            documentId,
        ]);
        return rows[0];
    }

    async updateDocument(documentId, data) {
        const [result] = await db.execute(`UPDATE documents SET title = ? WHERE document_id = ?`, [
            data.title,
            documentId,
        ]);
        return result.affectedRows;
    }

    async deleteDocument(documentId) {
        const [result] = await db.execute(`UPDATE documents SET deleted_at = NOW() WHERE document_id = ?`, [
            documentId,
        ]);
        return result.affectedRows;
    }
}

module.exports = new DocumentsModel();
