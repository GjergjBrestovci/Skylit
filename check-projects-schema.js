const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  console.log('�� Checking projects table schema...\n');
  
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
