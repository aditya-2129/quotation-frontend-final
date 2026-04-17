const { Client, Databases } = require('node-appwrite');
const fs = require('fs');
const path = require('path');

async function checkAttributes() {
    const envPath = path.resolve(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    envContent.split('\n').forEach(line => {
        const [key, ...value] = line.split('=');
        if (key && value.length > 0) {
            env[key.trim()] = value.join('=').trim().replace(/^"(.*)"$/, '$1');
        }
    });

    const client = new Client()
        .setEndpoint(env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
        .setProject(env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
        .setKey(env.APPWRITE_API_KEY);

    const databases = new Databases(client);

    try {
        const attr = await databases.getAttribute("machine-shop-database", "purchase_orders", "status");
        console.log("STATUS ATTRIBUTE ELEMENTS:", JSON.stringify(attr.elements));
    } catch (error) {
        console.error("ERROR:", error.message);
    }
}

checkAttributes();
