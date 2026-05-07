const multer = require('multer');

// Configure multer to use memory storage
// This is important because we want to upload directly to Azure Blob Storage
// without saving to the local disk first. The file will be available in req.file.buffer
const storage = multer.memoryStorage();

// Create the multer instance with basic configuration
// You can expand this with file size limits and file type filtering as needed
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB limit, adjust as needed
    },
});

// Export a middleware function for single file uploads
const uploadSingle = (fieldName) => {
    return upload.single(fieldName);
};

// Export a middleware function for multiple file uploads
const uploadMultiple = (fieldName, maxCount) => {
    return upload.array(fieldName, maxCount);
};

module.exports = {
    upload,
    uploadSingle,
    uploadMultiple,
};
