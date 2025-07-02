import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import mime from 'mime-types';

const UPLOAD_DIR = path.join(process.env.USERPROFILE || process.env.HOME, 'HR_Documents');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export const uploadDocuments = async (files) => {
    try {
        await fs.mkdir(UPLOAD_DIR, { recursive: true });

        const uploadResults = await Promise.all(
            files.map(async (file) => {
                validateFile(file);
                const fileExt = mime.extension(file.mimetype) || path.extname(file.originalname).slice(1);
                const fileName = `${uuidv4()}.${fileExt}`;
                const filePath = path.join(UPLOAD_DIR, fileName);

                await fs.writeFile(filePath, file.buffer);

                return {
                    originalName: file.originalname,
                    fileName,
                    filePath, // Full local path
                    mimeType: file.mimetype,
                    size: file.size,
                    downloadPath: `/download/${fileName}` // Route for download
                };
            })
        );

        return uploadResults;
    } catch (error) {
        console.error('Document upload failed:', error);
        throw new Error('Failed to upload documents');
    }
};

export const prepareLocalDownload = async (fileName) => {
    const filePath = path.join(UPLOAD_DIR, fileName);

    try {
        await fs.access(filePath);
        const stats = await fs.stat(filePath);
        const contentType = mime.lookup(filePath) || 'application/octet-stream';

        return {
            filePath,
            contentType,
            fileSize: stats.size
        };
    } catch (error) {
        console.error('File not found:', filePath);
        throw new Error('File not found');
    }
};

export const listDownloadableFiles = async () => {
    try {
        const files = await fs.readdir(UPLOAD_DIR);
        const fileStats = await Promise.all(
            files.map(async (file) => {
                const stats = await fs.stat(path.join(UPLOAD_DIR, file));
                return {
                    name: file,
                    size: stats.size,
                    lastModified: stats.mtime
                };
            })
        );
        return fileStats;
    } catch (error) {
        console.error('Error listing files:', error);
        return [];
    }
};

// Existing validation and utility functions...
const validateFile = (file) => {
    if (!file || !file.buffer || !file.mimetype) {
        throw new Error('Invalid file object');
    }
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        throw new Error(`File type ${file.mimetype} is not allowed`);
    }
};