import { databases, Query } from './src/lib/appwrite.js';
import { APPWRITE_CONFIG } from './src/constants/appwrite.js';

async function testQuery() {
    try {
        const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTIONS.QUOTATIONS,
            [
                Query.equal('status', 'Approved'),
                Query.contains('supplier_name', 'test')
            ]
        );
        console.log("Success:", response.total);
    } catch (e) {
        console.log("Error:", e.message);
    }
}

testQuery();
