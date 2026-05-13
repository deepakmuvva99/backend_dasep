const {
    BlobServiceClient,
    StorageSharedKeyCredential,
    BlobSASPermissions,
    generateBlobSASQueryParameters,
} = require('@azure/storage-blob');
require('dotenv').config();

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

if (!connectionString) {
    console.error('AZURE_STORAGE_CONNECTION_STRING is missing in .env');
}

const getBlobServiceClient = () => {
    return BlobServiceClient.fromConnectionString(connectionString);
};

/**
 * Extract AccountName and AccountKey from connection string
 */
const getCredentials = () => {
    const parts = connectionString.split(';');
    let accountName = '';
    let accountKey = '';

    for (const part of parts) {
        if (part.startsWith('AccountName=')) {
            accountName = part.split('=')[1];
        } else if (part.startsWith('AccountKey=')) {
            accountKey = part.split('=')[1];
        }
    }
    return { accountName, accountKey };
};

/**
 * Generate a SAS URL for a blob
 * @param {string} containerName 
 * @param {string} blobName 
 * @param {string} permissions 'r' for read, 'w' for write, 'rw' for both
 * @param {number} expiryInMinutes 
 */
const generateSASUrl = async (containerName, blobName, permissions = 'r', expiryInMinutes = 15) => {
    try {
        const { accountName, accountKey } = getCredentials();
        const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

        const sasOptions = {
            containerName,
            blobName,
            permissions: BlobSASPermissions.parse(permissions),
            // startsOn: Handle clock skew by starting 5 minutes in the past
            startsOn: new Date(new Date().valueOf() - 5 * 60 * 1000),
            // expiresOn: Set expiry based on parameter (default 15 mins)
            expiresOn: new Date(new Date().valueOf() + expiryInMinutes * 60 * 1000),
        };

        const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();
        const blobServiceClient = getBlobServiceClient();
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blobClient = containerClient.getBlobClient(blobName);

        return `${blobClient.url}?${sasToken}`;
    } catch (error) {
        console.error('Error generating SAS URL:', error);
        throw error;
    }
};

module.exports = {
    generateSASUrl,
};
