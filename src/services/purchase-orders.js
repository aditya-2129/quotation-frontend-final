import { databases, Query, ID } from '@/lib/appwrite';
import { APPWRITE_CONFIG } from '@/constants/appwrite';

const { DATABASE_ID, COLLECTIONS } = APPWRITE_CONFIG;

export const purchaseOrderService = {
    /**
     * List purchase orders with filters
     */
    async listOrders(limit = 25, offset = 0, filters = {}) {
        try {
            const queries = [
                Query.orderDesc("$createdAt"),
                Query.limit(limit),
                Query.offset(offset)
            ];

            const searchTerm = (filters.search || '').trim();
            if (searchTerm) {
                queries.push(Query.or([
                    Query.contains('po_number', searchTerm),
                    Query.contains('customer_name', searchTerm)
                ]));
            }

            if (filters.engineer && filters.engineer !== 'All') {
                queries.push(Query.equal('engineer_name', filters.engineer));
            }

            if (filters.status && filters.status !== 'All') {
                queries.push(Query.equal('status', filters.status));
            }

            if (filters.dateRange && filters.dateRange.start && filters.dateRange.end) {
                queries.push(Query.greaterThanEqual('$createdAt', new Date(filters.dateRange.start).toISOString()));
                queries.push(Query.lessThanEqual('$createdAt', new Date(filters.dateRange.end).toISOString()));
            }

            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.PURCHASE_ORDERS,
                queries
            );
            return response;
        } catch (error) {
            console.error("Appwrite Service Error [listOrders]:", error);
            throw error;
        }
    },

    /**
     * Get summary metrics for purchase orders
     */
    async getOrderMetrics(filters = {}) {
        try {
            const queries = [
                Query.limit(5000),
                Query.select(['total_amount', 'status'])
            ];

            // Re-use filter logic or keep it simple for metrics
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.PURCHASE_ORDERS,
                queries
            );

            const totalValue = response.documents.reduce((sum, doc) => sum + (parseFloat(doc.total_amount) || 0), 0);
            const activeOrders = response.documents.filter(doc => doc.status !== 'Completed' && doc.status !== 'Cancelled').length;
            
            return {
                count: response.total,
                totalValue: totalValue,
                activeCount: activeOrders,
                averageValue: response.total > 0 ? totalValue / response.total : 0
            };
        } catch (error) {
            console.error("Appwrite Service Error [getOrderMetrics]:", error);
            return { count: 0, totalValue: 0, activeCount: 0, averageValue: 0 };
        }
    },

    /**
     * Get a specific order
     */
    async getOrder(id) {
        try {
            return await databases.getDocument(DATABASE_ID, COLLECTIONS.PURCHASE_ORDERS, id);
        } catch (error) {
            console.error("Appwrite Service Error [getOrder]:", error);
            throw error;
        }
    },

    /**
     * Create a PO from a quotation (Internal use mainly)
     */
    async createOrder(data) {
        try {
            return await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.PURCHASE_ORDERS,
                ID.unique(),
                data
            );
        } catch (error) {
            console.error("Appwrite Service Error [createOrder]:", error);
            throw error;
        }
    },
    /**
     * Update order status
     */
    async updateStatus(id, status) {
        try {
            return await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.PURCHASE_ORDERS,
                id,
                { status }
            );
        } catch (error) {
            console.error("Appwrite Service Error [updateOrderStatus]:", error);
            throw error;
        }
    },

    async deleteOrder(id) {
        try {
            return await databases.deleteDocument(DATABASE_ID, COLLECTIONS.PURCHASE_ORDERS, id);
        } catch (error) {
            console.error("Appwrite Service Error [deleteOrder]:", error);
            throw error;
        }
    }
};
