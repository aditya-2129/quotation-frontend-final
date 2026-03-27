import { databases, Query } from '@/lib/appwrite';
import { APPWRITE_CONFIG } from '@/constants/appwrite';

const { DATABASE_ID, COLLECTIONS } = APPWRITE_CONFIG;

export const dashboardService = {
    /**
     * Get aggregated dashboard statistics from all collections in parallel.
     */
    async getDashboardStats() {
        try {
            const [
                allQuotations,
                draftQuotations,
                pendingQuotations,
                completedQuotations,
                customersCount,
                materialsCount,
            ] = await Promise.all([
                // All quotations (get total count + documents for revenue calc)
                databases.listDocuments(DATABASE_ID, COLLECTIONS.QUOTATIONS, [
                    Query.limit(5000),
                    Query.select(["total_amount", "status", "$createdAt"]),
                ]),
                // Draft count
                databases.listDocuments(DATABASE_ID, COLLECTIONS.QUOTATIONS, [
                    Query.equal("status", "Draft"),
                    Query.limit(1),
                ]),
                // Pending count
                databases.listDocuments(DATABASE_ID, COLLECTIONS.QUOTATIONS, [
                    Query.equal("status", "Pending"),
                    Query.limit(1),
                ]),
                // Completed count
                databases.listDocuments(DATABASE_ID, COLLECTIONS.QUOTATIONS, [
                    Query.equal("status", "Completed"),
                    Query.limit(1),
                ]),
                // Total customers
                databases.listDocuments(DATABASE_ID, COLLECTIONS.CUSTOMERS, [
                    Query.limit(1),
                ]),
                // Total materials
                databases.listDocuments(DATABASE_ID, COLLECTIONS.MATERIALS, [
                    Query.limit(1),
                ]),
            ]);

            // Calculate total revenue
            const totalRevenue = allQuotations.documents.reduce(
                (sum, doc) => sum + (parseFloat(doc.total_amount) || 0),
                0
            );

            // Calculate monthly trends
            const now = new Date();
            const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

            const thisMonthDocs = allQuotations.documents.filter(
                (d) => d.$createdAt >= startOfThisMonth
            );
            const lastMonthDocs = allQuotations.documents.filter(
                (d) => d.$createdAt >= startOfLastMonth && d.$createdAt < startOfThisMonth
            );

            const thisMonthRevenue = thisMonthDocs.reduce(
                (sum, doc) => sum + (parseFloat(doc.total_amount) || 0),
                0
            );
            const lastMonthRevenue = lastMonthDocs.reduce(
                (sum, doc) => sum + (parseFloat(doc.total_amount) || 0),
                0
            );

            const revenueTrend = lastMonthRevenue > 0
                ? (((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)
                : thisMonthRevenue > 0 ? '+100' : '0';

            return {
                totalRevenue,
                totalQuotations: allQuotations.total,
                draftCount: draftQuotations.total,
                pendingCount: pendingQuotations.total,
                completedCount: completedQuotations.total,
                totalCustomers: customersCount.total,
                totalMaterials: materialsCount.total,
                trends: {
                    revenue: revenueTrend,
                    quotationsThisMonth: thisMonthDocs.length,
                    quotationsLastMonth: lastMonthDocs.length,
                },
            };
        } catch (error) {
            console.error("Dashboard Service Error [getDashboardStats]:", error);
            throw error;
        }
    },

    /**
     * Get the most recent quotations for the dashboard table.
     */
    async getRecentQuotations(limit = 5) {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.QUOTATIONS,
                [
                    Query.orderDesc("$createdAt"),
                    Query.limit(limit),
                ]
            );
            return response.documents;
        } catch (error) {
            console.error("Dashboard Service Error [getRecentQuotations]:", error);
            throw error;
        }
    },
};
