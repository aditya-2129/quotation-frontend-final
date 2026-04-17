const { Client, Databases, Query } = require('node-appwrite');
const fs = require('fs');

async function debug() {
    const env = {};
    fs.readFileSync('.env', 'utf8').split('\n').filter(Boolean).forEach(l => {
        const parts = l.split('=');
        if (parts.length >= 2) {
            env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/^"(.*)"$/, '$1');
        }
    });

    const client = new Client()
        .setEndpoint(env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
        .setProject(env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
        .setKey(env.APPWRITE_API_KEY);

    const databases = new Databases(client);

    try {
        const res = await databases.listDocuments('machine-shop-database', 'purchase_orders', [Query.limit(1)]);
        console.log(JSON.stringify(res.documents[0], null, 2));
    } catch (e) {
        console.error(e);
    }
}

debug();
