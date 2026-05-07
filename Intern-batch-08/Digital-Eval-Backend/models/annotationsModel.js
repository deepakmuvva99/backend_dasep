const db = require('../config/database');

class AnnotationsModel {
    async createAnnotation(data) {
        const [result] = await db.execute(
            `INSERT INTO annotations (evaluation_id, page_id, annotation_type_id, pos_x, pos_y, pos_width, pos_height, position_data, content, created_by_faculty_id, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                data.evaluation_id,
                data.page_id,
                data.annotation_type_id,
                data.pos_x,
                data.pos_y,
                data.pos_width,
                data.pos_height,
                JSON.stringify(data.position_data || {}),
                data.content,
                data.created_by_faculty_id,
            ],
        );
        return result.insertId;
    }

    async getAnnotationsByPageId(pageId) {
        const [rows] = await db.execute(
            `SELECT a.*, u.name as faculty_name 
             FROM annotations a
             JOIN faculty f ON a.created_by_faculty_id = f.faculty_id
             JOIN users u ON f.user_id = u.user_id
             WHERE a.page_id = ? AND a.deleted_at IS NULL`,
            [pageId],
        );
        return rows;
    }

    async getAnnotationsByEvaluationId(evaluationId) {
        const [rows] = await db.execute(
            `SELECT a.*, u.name as faculty_name 
             FROM annotations a
             JOIN faculty f ON a.created_by_faculty_id = f.faculty_id
             JOIN users u ON f.user_id = u.user_id
             WHERE a.evaluation_id = ? AND a.deleted_at IS NULL`,
            [evaluationId],
        );
        return rows;
    }

    async findById(annotationId) {
        const [rows] = await db.execute(`SELECT * FROM annotations WHERE annotation_id = ? AND deleted_at IS NULL`, [
            annotationId,
        ]);
        return rows[0];
    }

    async updateAnnotation(annotationId, data) {
        const [result] = await db.execute(
            `UPDATE annotations SET 
                pos_x = ?, pos_y = ?, pos_width = ?, pos_height = ?, 
                position_data = ?, content = ?, annotation_type_id = ? 
             WHERE annotation_id = ?`,
            [
                data.pos_x,
                data.pos_y,
                data.pos_width,
                data.pos_height,
                JSON.stringify(data.position_data || {}),
                data.content,
                data.annotation_type_id,
                annotationId,
            ],
        );
        return result.affectedRows;
    }

    async deleteAnnotation(annotationId) {
        const [result] = await db.execute(`UPDATE annotations SET deleted_at = NOW() WHERE annotation_id = ?`, [
            annotationId,
        ]);
        return result.affectedRows;
    }
}

module.exports = new AnnotationsModel();
