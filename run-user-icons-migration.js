// Run with: node run-user-icons-migration.js
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
    console.log('Running user_icons migration...');

    // Create user_icons table using Supabase REST API
    const { error } = await supabase.rpc('exec_sql', {
        sql: `
      CREATE TABLE IF NOT EXISTS user_icons (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE user_icons ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Allow public read" ON user_icons;
      CREATE POLICY "Allow public read" ON user_icons
        FOR SELECT USING (true);

      DROP POLICY IF EXISTS "Allow all operations" ON user_icons;
      CREATE POLICY "Allow all operations" ON user_icons
        FOR ALL USING (true) WITH CHECK (true);
    `
    });

    if (error) {
        // If RPC doesn't exist, try direct table access to check if it works
        console.log('RPC not available, checking if table already exists...');
        const { data, error: selectError } = await supabase
            .from('user_icons')
            .select('id')
            .limit(1);

        if (selectError && selectError.code === '42P01') {
            console.log('\n⚠️  Table does not exist. Please run this SQL in Supabase SQL Editor:');
            console.log(`
CREATE TABLE IF NOT EXISTS user_icons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_icons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON user_icons
    FOR SELECT USING (true);

CREATE POLICY "Allow all operations" ON user_icons
    FOR ALL USING (true) WITH CHECK (true);
      `);
        } else if (selectError) {
            console.error('Error:', selectError.message);
        } else {
            console.log('✓ user_icons table already exists!');
        }
    } else {
        console.log('✓ Migration completed successfully!');
    }
}

runMigration().catch(console.error);
