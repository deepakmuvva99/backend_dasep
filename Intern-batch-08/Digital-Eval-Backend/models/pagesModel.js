const db = require('../config/database');

class PagesModel {
    async createPages(versionId, pages) {
        if (!pages || pages.length === 0) return 0;

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const values = [];
            const placeholders = pages
                .map((p) => {
                    values.push(
                        versionId,
                        p.page_number,
                        p.width || null,
                        p.height || null,
                    );
                    return '(?, ?, ?, ?)';
                })
                .join(', ');

            const [result] = await connection.execute(
                `INSERT INTO pages (version_id, page_number, width, height)
                 VALUES ${placeholders}`,
                values,
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
            `SELECT * FROM pages WHERE version_id = ? AND deleted_at IS NULL ORDER BY page_number ASC`,
            [versionId],
        );
        return rows;
    }

    async findById(pageId) {
        const [rows] = await db.execute(`SELECT * FROM pages WHERE page_id = ? AND deleted_at IS NULL`, [pageId]);
        return rows[0];
    }

    async deletePage(pageId) {
        const [result] = await db.execute(`UPDATE pages SET deleted_at = NOW() WHERE page_id = ?`, [pageId]);
        return result.affectedRows;
    }
}

module.exports = new PagesModel();
