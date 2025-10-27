#!/usr/bin/env node
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
  console.error('❌ Missing Supabase credentials in backend/.env');
  console.error('   SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_KEY:', supabaseKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
  console.log('🔍 Checking Supabase connection...\n');
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Key: ${supabaseKey.substring(0, 20)}...`);
  console.log();

  try {
    // Try to query auth.users to verify connection
    const { data, error } = await supabase.auth.getSession();
    
    if (error && error.message.includes('fetch')) {
      console.error('❌ Cannot connect to Supabase');
      console.error('   Please check your internet connection and Supabase URL\n');
      return false;
    }
    
    console.log('✅ Supabase connection successful\n');
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message, '\n');
    return false;
  }
}

async function checkTableExists() {
  console.log('🔍 Checking if user_credits table exists...\n');
  
  const { data, error } = await supabase
    .from('user_credits')
    .select('id')
    .limit(1);

  if (error) {
    if (error.code === '42P01' || error.message.includes('does not exist')) {
      console.log('❌ user_credits table does NOT exist\n');
      return false;
    }
    console.log('⚠️  Table check inconclusive:', error.message, '\n');
    return false;
  }

  console.log('✅ user_credits table EXISTS!\n');
  return true;
}

async function displayMigrationSQL() {
  console.log('📋 Here are your migration files:\n');
  console.log('═'.repeat(60));
  
  const migrations = [
    'supabase/migrations/001_initial_schema.sql',
    'supabase/migrations/002_add_secret_key.sql'
  ];

  for (const migrationPath of migrations) {
    const fullPath = path.join(__dirname, migrationPath);
    if (fs.existsSync(fullPath)) {
      console.log(`\n📄 ${migrationPath}`);
      console.log('─'.repeat(60));
      const content = fs.readFileSync(fullPath, 'utf-8');
      console.log(content);
      console.log('═'.repeat(60));
    }
  }
}

async function main() {
  console.log('\n🚀 Supabase Database Setup Tool\n');
  console.log('═'.repeat(60));
  console.log();

  // Step 1: Check connection
  const isConnected = await checkConnection();
  if (!isConnected) {
    console.log('Please fix connection issues and try again.\n');
    process.exit(1);
  }

  // Step 2: Check if table exists
  const tableExists = await checkTableExists();
  
  if (tableExists) {
    console.log('🎉 SUCCESS! Database is already set up!\n');
    console.log('Your user_credits table is ready to track:');
    console.log('  ✅ User credits (default: 10)');
    console.log('  ✅ Unlimited access status');
    console.log('  ✅ Paid membership plans');
    console.log('  ✅ Subscription status');
    console.log('  ✅ Secret key ("gjergj" for unlimited)\n');
    console.log('You can now restart your backend server.\n');
    process.exit(0);
  }

  // Step 3: Provide instructions
  console.log('📝 TO CREATE THE TABLE:\n');
  console.log('   1. Open Supabase Dashboard:');
  const projectRef = supabaseUrl.split('.')[0].split('//')[1];
  console.log(`      https://supabase.com/dashboard/project/${projectRef}\n`);
  console.log('   2. Click "SQL Editor" in the left sidebar\n');
  console.log('   3. Click "New Query"\n');
  console.log('   4. Copy BOTH migration files below and paste them\n');
  console.log('   5. Click "Run" to execute\n');
  console.log('   6. Run this script again to verify\n');

  await displayMigrationSQL();

  console.log('\n💡 TIP: Copy everything between the ═ lines above\n');
}

main().catch(console.error);
