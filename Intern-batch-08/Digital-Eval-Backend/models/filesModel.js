const db = require('../config/database');

class FilesModel {
    async getTypes() {
        const [rows] = await db.execute(`SELECT file_type_id as id, name, description FROM file_types`);
        return rows;
    }

    async createFile(data) {
        const [result] = await db.execute(
            `INSERT INTO files (document_id, original_file_name, mime_type, file_size_kb, file_type_id)
             VALUES (?, ?, ?, ?, ?)`,
            [data.document_id, data.original_file_name, data.mime_type, data.file_size_kb, data.file_type_id],
        );
        return result.insertId;
    }

    async createVersion(data) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const [latest] = await connection.execute(
                `SELECT MAX(version_number) as max_v FROM file_versions WHERE file_id = ?`,
                [data.file_id],
            );
            const nextVersion = latest[0].max_v ? latest[0].max_v + 1 : 1;

            const [result] = await connection.execute(
                `INSERT INTO file_versions (file_id, version_number, blob_name, container_name, etag)
                 VALUES (?, ?, ?, ?, ?)`,
                [data.file_id, nextVersion, data.blob_name, data.container_name, data.etag],
            );

            const versionId = result.insertId;

            // Atomically update current_version_id in files table
            await connection.execute(`UPDATE files SET current_version_id = ? WHERE file_id = ?`, [
                versionId,
                data.file_id,
            ]);

            await connection.commit();
            return { version_id: versionId, version_number: nextVersion };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async findById(fileId) {
        const [rows] = await db.execute(
            `SELECT f.*, ft.name as file_type, v.blob_name, v.container_name, v.etag as version_etag
             FROM files f
             JOIN file_types ft ON f.file_type_id = ft.file_type_id
             LEFT JOIN file_versions v ON f.current_version_id = v.version_id
             WHERE f.file_id = ? AND f.is_deleted = FALSE`,
            [fileId],
        );
        return rows[0];
    }

    async getVersionsByFileId(fileId, pagination) {
        let query = `SELECT * FROM file_versions WHERE file_id = ? ORDER BY version_number DESC`;
        const countQuery = `SELECT COUNT(*) as total FROM file_versions WHERE file_id = ?`;

        const [countRows] = await db.execute(countQuery, [fileId]);
        const total = countRows[0].total;

        query += ` LIMIT ? OFFSET ?`;
        const [rows] = await db.execute(query, [fileId, pagination.limit, pagination.offset]);

        return { rows, total };
    }

    async getCurrentVersion(fileId) {
        const [rows] = await db.execute(
            `SELECT v.* 
             FROM file_versions v
             JOIN files f ON f.current_version_id = v.version_id
             WHERE f.file_id = ?`,
            [fileId],
        );
        return rows[0];
    }

    async deleteFile(fileId) {
        const [result] = await db.execute(`UPDATE files SET is_deleted = TRUE WHERE file_id = ?`, [fileId]);
        return result.affectedRows;
    }
}

module.exports = new FilesModel();
