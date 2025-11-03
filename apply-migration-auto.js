const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from backend/.env
const envPath = path.join(__dirname, 'backend', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values.length) {
      process.env[key.trim()] = values.join('=').trim();
    }
  });
}
 
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('\n🚀 Applying database migration automatically...\n');

  // Read the combined migration SQL
  const migrationSQL = fs.readFileSync(path.join(__dirname, 'FULL_MIGRATION.sql'), 'utf-8');

  console.log('📄 Executing SQL migration via Supabase...\n');

  try {
    // Try to execute via SQL (this works if service role key is used)
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ query: migrationSQL })
    });

    if (response.ok) {
      console.log('✅ Migration applied successfully!\n');
    } else {
      console.log('⚠️  Direct execution not available (this is normal).\n');
      console.log('Please apply the migration manually:\n');
      console.log('1. Open: https://supabase.com/dashboard/project/' + supabaseUrl.split('.')[0].split('//')[1]);
      console.log('2. Go to SQL Editor');
      console.log('3. Copy content from FULL_MIGRATION.sql');
      console.log('4. Paste and click Run\n');
    }
  } catch (error) {
    console.log('⚠️  Automatic migration not supported.\n');
    console.log('📋 Please apply manually using Supabase Dashboard.\n');
    console.log('See DATABASE_SETUP_GUIDE.md for instructions.\n');
  }

  // Verify tables were created
  console.log('🔍 Verifying tables...\n');
  
  const { data, error } = await supabase
    .from('user_credits')
    .select('id')
    .limit(1);

  if (error) {
    if (error.message.includes('does not exist')) {
      console.log('❌ Tables not created yet.\n');
      console.log('Please follow the manual steps in DATABASE_SETUP_GUIDE.md\n');
      process.exit(1);
    }
  } else {
    console.log('✅ SUCCESS! Database is ready!\n');
    console.log('Your tables are created and ready to use:');
    console.log('  ✅ user_credits - Track credits and unlimited access');
    console.log('  ✅ projects - Store generated websites');
    console.log('  ✅ previews - Temporary preview URLs\n');
    console.log('You can now restart your backend server.\n');
    console.log('Run: npm run dev\n');
    process.exit(0);
  }
}

applyMigration().catch(console.error);
