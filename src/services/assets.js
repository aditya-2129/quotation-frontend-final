import { storage, ID } from '@/lib/appwrite';
import { APPWRITE_CONFIG } from '@/constants/appwrite';

const { BUCKETS } = APPWRITE_CONFIG;

export const assetService = {
    async uploadFile(file) {
        try {
            const response = await storage.createFile(
                BUCKETS.INQUIRY_FILES,
                ID.unique(),
                file
            );
            return response;
        } catch (error) {
            console.error("Appwrite Service Error [uploadFile]:", error);
            throw error;
        }
    },

    getFilePreview(fileId) {
        try {
            return storage.getFilePreview(BUCKETS.INQUIRY_FILES, fileId);
        } catch (error) {
            console.error("Appwrite Service Error [getFilePreview]:", error);
            return null;
        }
    },

    getFileView(fileId) {
        try {
            return storage.getFileView(BUCKETS.INQUIRY_FILES, fileId);
        } catch (error) {
            console.error("Appwrite Service Error [getFileView]:", error);
            return null;
        }
    },

    async deleteFile(fileId) {
        try {
            await storage.deleteFile(BUCKETS.INQUIRY_FILES, fileId);
            return true;
        } catch (error) {
            console.error("Appwrite Service Error [deleteFile]:", error);
            throw error;
        }
    }
};
