const filesModel = require('../models/filesModel');
const blobStorageService = require('./blobStorage');

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

    async getSasToken(fileId, permissions = 'r') {
        await this.getFileDetails(fileId);
        const currentVersion = await filesModel.getCurrentVersion(fileId);

        if (!currentVersion) {
            const error = new Error('No version found for this file');
            error.statusCode = 404;
            error.code = 'NOT_FOUND';
            throw error;
        }

        const sasUrl = blobStorageService.generateSasToken(
            currentVersion.container_name,
            currentVersion.blob_name,
            permissions,
        );

        return { sas_url: sasUrl, file_id: fileId };
    }

    async requestUploadUrl(fileName) {
        const containerName = 'submissions'; // Default container
        const timestamp = Date.now();
        const blobName = `${timestamp}-${fileName.replace(/\s+/g, '_')}`;

        const sasUrl = blobStorageService.generateSasToken(containerName, blobName, 'w', 30); // 30 mins write access

        return {
            upload_url: sasUrl,
            blob_name: blobName,
            container_name: containerName,
        };
    }
}

module.exports = new FilesService();
