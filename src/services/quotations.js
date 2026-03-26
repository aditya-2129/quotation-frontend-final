import { databases, ID, Query } from '@/lib/appwrite';
import { APPWRITE_CONFIG } from '@/constants/appwrite';

const { DATABASE_ID, COLLECTIONS } = APPWRITE_CONFIG;

export const quotationService = {
    // List all quotations
    async listQuotations(limit = 25, offset = 0) {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.QUOTATIONS,
                [
                    Query.orderDesc("$createdAt"),
                    Query.limit(limit),
                    Query.offset(offset)
                ]
            );
            return response;
        } catch (error) {
            console.error("Appwrite Service Error [listQuotations]:", error);
            throw error;
        }
    },

    async generateNextQuotationID() {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.QUOTATIONS,
                [
                    Query.orderDesc("$createdAt"),
                    Query.limit(1)
                ]
            );
            
            if (response.total === 0) return 'QTN-00001';
            
            const lastId = response.documents[0].quotation_no;
            const lastNum = parseInt(lastId.split('-')[1]) || 0;
            const nextNum = (lastNum + 1).toString().padStart(5, '0');
            return `QTN-${nextNum}`;
        } catch (error) {
            console.error("Failed to generate ID:", error);
            // Fallback to random if DB fetch fails
            return `QTN-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
        }
    },

    // Create a new quotation
    async createQuotation(data) {
        try {
            const response = await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.QUOTATIONS,
                ID.unique(),
                data
            );
            return response;
        } catch (error) {
            console.error("Appwrite Service Error [createQuotation]:", error);
            throw error;
        }
    },

    // Get a specific quotation
    async getQuotation(id) {
        try {
            const response = await databases.getDocument(
                DATABASE_ID,
                COLLECTIONS.QUOTATIONS,
                id
            );
            return response;
        } catch (error) {
            console.error("Appwrite Service Error [getQuotation]:", error);
            throw error;
        }
    },

    // Update an existing quotation
    async updateQuotation(id, data) {
        try {
            const response = await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.QUOTATIONS,
                id,
                data
            );
            return response;
        } catch (error) {
            console.error("Appwrite Service Error [updateQuotation]:", error);
            throw error;
        }
    },

    // Delete a quotation
    async deleteQuotation(id) {
        try {
            await databases.deleteDocument(
                DATABASE_ID,
                COLLECTIONS.QUOTATIONS,
                id
            );
            return true;
        } catch (error) {
            console.error("Appwrite Service Error [deleteQuotation]:", error);
            throw error;
        }
    }
};
