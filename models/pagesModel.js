const db = require('../config/database');

class PagesModel {
    async createPages(fileId, versionId, pages) {
        if (!pages || pages.length === 0) return 0;
        
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const values = [];
            const placeholders = pages.map(p => {
                values.push(fileId, versionId, p.page_number, p.blob_name, p.container_name, p.extracted_text || null);
                return '(?, ?, ?, ?, ?, ?)';
            }).join(', ');

            const [result] = await connection.execute(
                `INSERT INTO pages (file_id, version_id, page_number, blob_name, container_name, extracted_text)
                 VALUES ${placeholders}`,
                values
            );

            await connection.commit();
            return result.affectedRows;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async getPagesByVersionId(versionId) {
        const [rows] = await db.execute(
            `SELECT * FROM pages WHERE version_id = ? ORDER BY page_number ASC`,
            [versionId]
        );
        return rows;
    }

    async getPagesByFileId(fileId) {
        const [rows] = await db.execute(
            `SELECT * FROM pages WHERE file_id = ? ORDER BY page_number ASC`,
            [fileId]
        );
        return rows;
    }

    async findById(pageId) {
        const [rows] = await db.execute(`SELECT * FROM pages WHERE page_id = ?`, [pageId]);
        return rows[0];
    }

    async deletePage(pageId) {
        const [result] = await db.execute(`DELETE FROM pages WHERE page_id = ?`, [pageId]);
        return result.affectedRows;
    }
}

module.exports = new PagesModel();
