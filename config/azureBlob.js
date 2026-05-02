const { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } = require('@azure/storage-blob');
const dotenv = require('dotenv');
dotenv.config();

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

let blobServiceClient;
let sharedKeyCredential;

try {
    if (!connectionString) {
        throw new Error("AZURE_STORAGE_CONNECTION_STRING is not defined in environment variables.");
    }
    
    blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    
    // Extract account name and key from connection string for SAS token generation
    const matchAccountName = connectionString.match(/AccountName=([^;]+)/);
    const matchAccountKey = connectionString.match(/AccountKey=([^;]+)/);
    
    if (matchAccountName && matchAccountKey) {
        sharedKeyCredential = new StorageSharedKeyCredential(matchAccountName[1], matchAccountKey[1]);
    } else {
        console.warn("Could not extract account name and key from connection string for SAS generation.");
    }

    console.log("Azure Blob Storage client initialized successfully.");
} catch (error) {
    console.error("Error initializing Azure Blob Storage client:", error);
}

module.exports = {
    blobServiceClient,
    sharedKeyCredential,
    generateBlobSASQueryParameters,
    BlobSASPermissions
};
