const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    // Connection string from run-migration.js
    const client = new Client({
        connectionString: 'postgresql://postgres.buuaboklwyrwycnugack:GAKBAHAYATA@aws-1-ap-south-1.pooler.supabase.com:5432/postgres',
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Connecting to database...');
        await client.connect();
        console.log('Connected!');

        const sqlPath = path.join(__dirname, 'supabase-storage.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running storage migration...');
        await client.query(sql);
        console.log('Storage migration completed successfully!');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
        console.log('Done!');
    }
}

runMigration();
