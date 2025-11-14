const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load backend/.env without requiring a root-level dotenv dependency
const dotenvPath = path.join(__dirname, 'backend', 'node_modules', 'dotenv');
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const dotenv = require(dotenvPath);
  dotenv.config({ path: path.join(__dirname, 'backend', '.env') });
} catch (err) {
  console.warn('⚠️  Unable to load dotenv from backend/node_modules.');
  console.warn('    Run `npm install` at the repo root so workspace dependencies are hoisted.');
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  console.log('\n🔍 Checking projects table schema...\n');
  
  // Try to get table structure
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('❌ Error:', error.message);
    console.log('\nTable might not exist yet. Try running FULL_MIGRATION.sql first.');
    return;
  }
  
  console.log('✅ Projects table exists!');
  
  if (data && data.length > 0) {
    console.log('\nColumns found:', Object.keys(data[0]).join(', '));
  } else {
    console.log('\nTable exists but no data yet (empty table).');
    console.log('Cannot determine columns from empty table.');
  }
}

checkSchema();
