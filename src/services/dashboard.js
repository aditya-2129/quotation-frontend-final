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
                approvedQuotations,
                rejectedQuotations,
                completedQuotations,
                customersCount,
                materialsCount,
                oldestReviewDocs,
                poCount,
            ] = await Promise.all([
                // All quotations (filter out cancelled)
                databases.listDocuments(DATABASE_ID, COLLECTIONS.QUOTATIONS, [
                    Query.notEqual("status", "Cancelled"),
                    Query.limit(5000),
                    Query.select(["total_amount", "status", "$createdAt"]),
                ]),
                // Draft count
                databases.listDocuments(DATABASE_ID, COLLECTIONS.QUOTATIONS, [
                    Query.equal("status", "Draft"),
                    Query.limit(1),
                ]),
                // Approved count
                databases.listDocuments(DATABASE_ID, COLLECTIONS.QUOTATIONS, [
                    Query.equal("status", "Approved"),
                    Query.limit(1),
                ]),
                // Rejected count
                databases.listDocuments(DATABASE_ID, COLLECTIONS.QUOTATIONS, [
                    Query.equal("status", "Rejected"),
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
                // Oldest review item — for "Xd ago" sub-label on the KPI card
                databases.listDocuments(DATABASE_ID, COLLECTIONS.QUOTATIONS, [
                    Query.equal("status", "Completed"),
                    Query.orderAsc("$createdAt"),
                    Query.limit(1),
                    Query.select(["$createdAt"]),
                ]),
                // PO count
                databases.listDocuments(DATABASE_ID, COLLECTIONS.PURCHASE_ORDERS, [
                    Query.limit(1),
                ]),
            ]);

            // Calculate total revenue (excluding cancelled)
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

            const pipelineValue = allQuotations.documents
                .filter(d => d.status !== "Approved" && d.status !== "Rejected")
                .reduce((sum, doc) => sum + (parseFloat(doc.total_amount) || 0), 0);

            const oldestReviewCreatedAt = oldestReviewDocs.documents[0]?.$createdAt ?? null;

            const approvedThisMonthDocs = allQuotations.documents.filter(
                (d) => d.status === "Approved" && d.$createdAt >= startOfThisMonth
            );
            const approvedThisMonthValue = approvedThisMonthDocs.reduce(
                (sum, doc) => sum + (parseFloat(doc.total_amount) || 0),
                0
            );

            return {
                totalRevenue,
                totalQuotations: allQuotations.total,
                draftCount: draftQuotations.total,
                approvedCount: approvedQuotations.total,
                rejectedCount: rejectedQuotations.total,
                completedCount: completedQuotations.total,
                totalCustomers: customersCount.total,
                totalMaterials: materialsCount.total,
                pipelineValue,
                oldestReviewCreatedAt,
                poCount: poCount.total,
                approvedThisMonthCount: approvedThisMonthDocs.length,
                approvedThisMonthValue,
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
                    Query.notEqual("status", "Cancelled"),
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

    /**
     * Get quotations awaiting admin approval (status = "Completed"), oldest-first.
     */
    async getReviewQueue(limit = 5) {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.QUOTATIONS,
                [
                    Query.equal("status", "Completed"),
                    Query.orderAsc("$createdAt"),
                    Query.limit(limit),
                ]
            );
            return response.documents;
        } catch (error) {
            console.error("Dashboard Service Error [getReviewQueue]:", error);
            throw error;
        }
    },
};
