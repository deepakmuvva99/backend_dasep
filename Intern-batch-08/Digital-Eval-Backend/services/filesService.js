const filesModel = require('../models/filesModel');

class FilesService {
    async getFileTypes() {
        return await filesModel.getTypes();
    }

    async uploadNewFile(data) {
        // Logic to store in Azure Blob should be here or in a helper
        // For now, we simulate metadata insertion
        const fileId = await filesModel.createFile(data);
        const version = await filesModel.createVersion({
            file_id: fileId,
            blob_name: data.blob_name,
            container_name: data.container_name,
            etag: data.etag || null,
        });
        return { file_id: fileId, ...data, version };
    }

    async uploadNewVersion(fileId, data) {
        await this.getFileDetails(fileId);
        const version = await filesModel.createVersion({
            file_id: fileId,
            blob_name: data.blob_name,
            container_name: data.container_name,
            etag: data.etag || null,
        });
        return version;
    }

    async getFileDetails(fileId) {
        const file = await filesModel.findById(fileId);
        if (!file) {
            const error = new Error('File not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }
        return file;
    }

    async getVersions(fileId, pagination) {
        await this.getFileDetails(fileId);
        return await filesModel.getVersionsByFileId(fileId, pagination);
    }

    async getCurrentVersion(fileId) {
        await this.getFileDetails(fileId);
        return await filesModel.getCurrentVersion(fileId);
    }

    async deleteFile(fileId) {
        const affected = await filesModel.deleteFile(fileId);
        if (affected === 0) {
            const error = new Error('File not found');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }
        return true;
    }
}

module.exports = new FilesService();
