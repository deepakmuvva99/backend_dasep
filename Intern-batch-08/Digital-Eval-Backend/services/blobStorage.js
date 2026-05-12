const {
    blobServiceClient,
    sharedKeyCredential,
    generateBlobSASQueryParameters,
    BlobSASPermissions,
} = require('../config/azureBlob');

class BlobStorageService {
    constructor() {
        this.containerClients = {};
    }

    /**
     * Get or create a container client
     */
    async getContainerClient(containerName) {
        if (!blobServiceClient) {
            throw new Error('Blob Storage client is not initialized.');
        }

        if (!this.containerClients[containerName]) {
            const containerClient = blobServiceClient.getContainerClient(containerName);
            // Ensure container exists
            await containerClient.createIfNotExists();
            this.containerClients[containerName] = containerClient;
        }
        return this.containerClients[containerName];
    }

    /**
     * Upload a file to Azure Blob Storage
     * @param {string} containerName - The container to upload to
     * @param {string} blobName - The name of the blob
     * @param {Buffer|Stream} content - The file content
     * @param {string} contentType - The MIME type of the file
     */
    async uploadFile(containerName, blobName, content, contentType) {
        try {
            const containerClient = await this.getContainerClient(containerName);
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);

            const uploadOptions = {
                blobHTTPHeaders: { blobContentType: contentType },
            };

            await blockBlobClient.upload(content, content.length, uploadOptions);
            return blockBlobClient.url;
        } catch (error) {
            console.error('Error uploading file to Blob Storage:', error);
            throw new Error('Failed to upload file');
        }
    }

    /**
     * Generate a SAS Token for a specific blob
     * @param {string} containerName - The container name
     * @param {string} blobName - The blob name
     * @param {number} expiresInMinutes - Expiry time in minutes
     */
    generateSasToken(containerName, blobName, expiresInMinutes = 60) {
        try {
            if (!sharedKeyCredential) {
                throw new Error('Shared Key Credential is not available for SAS token generation.');
            }

            const startDate = new Date();
            const expiryDate = new Date(startDate);
            expiryDate.setMinutes(startDate.getMinutes() + expiresInMinutes);

            const sasOptions = {
                containerName,
                blobName,
                permissions: BlobSASPermissions.parse('r'), // Read-only access
                startsOn: startDate,
                expiresOn: expiryDate,
            };

            const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();

            // Return full URL with SAS token
            const containerClient = blobServiceClient.getContainerClient(containerName);
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);

            return `${blockBlobClient.url}?${sasToken}`;
        } catch (error) {
            console.error('Error generating SAS token:', error);
            throw new Error('Failed to generate SAS token');
        }
    }

    /**
     * Delete a file from Azure Blob Storage
     * @param {string} containerName - The container name
     * @param {string} blobName - The blob name
     */
    async deleteFile(containerName, blobName) {
        try {
            const containerClient = await this.getContainerClient(containerName);
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            await blockBlobClient.deleteIfExists();
            return true;
        } catch (error) {
            console.error('Error deleting file from Blob Storage:', error);
            throw new Error('Failed to delete file');
        }
    }
}

module.exports = new BlobStorageService();
