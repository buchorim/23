const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    const client = new Client({
        connectionString: 'postgresql://postgres.buuaboklwyrwycnugack:GAKBAHAYATA@aws-1-ap-south-1.pooler.supabase.com:5432/postgres',
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Connecting to database...');
        await client.connect();
        console.log('Connected!');

        const sqlPath = path.join(__dirname, 'supabase-migration.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running migration...');
        await client.query(sql);
        console.log('Migration completed successfully!');

        // Create storage bucket
        console.log('Creating storage bucket...');
        try {
            await client.query(`
        INSERT INTO storage.buckets (id, name, public) 
        VALUES ('media', 'media', true)
        ON CONFLICT (id) DO NOTHING;
      `);
            console.log('Storage bucket created!');
        } catch (e) {
            console.log('Storage bucket may already exist or requires different permissions');
        }

        // Verify tables
        const result = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('categories', 'documents', 'site_settings')
    `);
        console.log('Tables created:', result.rows.map(r => r.table_name).join(', '));

        // Count categories
        const catCount = await client.query('SELECT COUNT(*) FROM categories');
        console.log('Categories:', catCount.rows[0].count);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
        console.log('Done!');
    }
}

runMigration();
