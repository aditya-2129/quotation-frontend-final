import { databases, Query } from '@/lib/appwrite';
import { APPWRITE_CONFIG } from '@/constants/appwrite';

const { DATABASE_ID, COLLECTIONS } = APPWRITE_CONFIG;

export const approvedQuotationService = {
    /**
     * List only quotations with status 'Approved'
     */
    async listApprovedQuotations(limit = 25, offset = 0, filters = {}) {
        try {
            const queries = [
                Query.equal('status', 'Approved'),
                Query.orderDesc("quotation_no"),
                Query.limit(limit),
                Query.offset(offset)
            ];

            if (filters.engineer && filters.engineer !== 'All') {
                queries.push(Query.equal('quoting_engineer', filters.engineer));
            }

            if (filters.timePeriod && filters.timePeriod !== 'All Time') {
                const now = new Date();
                let pastDate = new Date();
                
                if (filters.timePeriod === 'Last 30 Days') pastDate.setDate(now.getDate() - 30);
                else if (filters.timePeriod === 'Last 90 Days') pastDate.setDate(now.getDate() - 90);
                else if (filters.timePeriod === 'This Year') pastDate = new Date(now.getFullYear(), 0, 1);
                else if (filters.timePeriod === 'Last Year') pastDate = new Date(now.getFullYear() - 1, 0, 1);

                queries.push(Query.greaterThanEqual('$createdAt', pastDate.toISOString()));
            }

            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.QUOTATIONS,
                queries
            );
            return response;
        } catch (error) {
            console.error("Appwrite Service Error [listApprovedQuotations]:", error);
            throw error;
        }
    },

    /**
     * Get a specific quotation by ID (for preview/download)
     */
    async getQuotation(id) {
        try {
            const response = await databases.getDocument(
                DATABASE_ID,
                COLLECTIONS.QUOTATIONS,
                id
            );
            return response;
        } catch (error) {
            console.error("Appwrite Service Error [getApprovedQuotation]:", error);
            throw error;
        }
    }
};
