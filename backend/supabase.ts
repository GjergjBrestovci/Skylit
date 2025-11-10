import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
// Ensure env is loaded regardless of run mode
import './config/loadEnv';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL as string | undefined;
// Use SERVICE_ROLE_KEY for backend operations (bypasses RLS)
// Use ANON_KEY only for auth operations
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY as string | undefined;

// Check if we have valid Supabase configuration
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Backend client using service role (bypasses RLS for admin operations)
let supabase: any;
// Auth client using anon key (respects RLS for user operations)
let supabaseAuth: any;

if (!supabaseUrl || (!supabaseServiceKey && !supabaseAnonKey) || 
    supabaseUrl.includes('your_supabase') || 
    !isValidUrl(supabaseUrl)) {
  console.warn('⚠️  Supabase not configured properly. Using mock client.');
  console.warn('   Please update SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_ANON_KEY in .env');
  
  // Mock client that won't crash the server
  const mockClient = {
    auth: {
      signUp: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      signInWithPassword: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      getUser: async () => ({ data: { user: null }, error: { message: 'Supabase not configured' } })
    },
    from: () => ({
      insert: () => ({ select: () => ({ single: async () => ({ data: null, error: { message: 'Supabase not configured' } }) }) }),
      select: () => ({ eq: () => ({ order: async () => ({ data: [], error: null }) }) })
    })
  };
  supabase = mockClient;
  supabaseAuth = mockClient;
} else {
  console.log('✅ Supabase configured with URL:', supabaseUrl);
  
  // Backend client with service role key (bypasses RLS for server-side operations)
  if (supabaseServiceKey) {
    console.log('✅ Using SERVICE_ROLE key for backend database operations (RLS bypassed)');
    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  } else {
    console.warn('⚠️  No SERVICE_ROLE_KEY found, using ANON_KEY (RLS will apply)');
    supabase = createClient(supabaseUrl, supabaseAnonKey!);
  }
  
  // Auth client with anon key for user authentication
  if (supabaseAnonKey) {
    console.log('✅ Using ANON key for authentication operations');
    supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
  } else {
    console.warn('⚠️  No ANON_KEY found, using SERVICE_ROLE for auth (not recommended)');
    supabaseAuth = supabase;
  }
}

export { supabase, supabaseAuth };

// Database types (you can generate these from Supabase CLI later)
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  prompt: string | null;
  generated_code: string | null;
  created_at: string;
  updated_at: string;
}
