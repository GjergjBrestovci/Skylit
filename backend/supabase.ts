import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
// Ensure env is loaded regardless of run mode
import './config/loadEnv';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL as string | undefined;
const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY) as string | undefined;

// Check if we have valid Supabase configuration
const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

let supabase: any;

if (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl.includes('your_supabase') || 
    !isValidUrl(supabaseUrl)) {
  console.warn('⚠️  Supabase not configured properly. Using mock client.');
  console.warn('   Please update SUPABASE_URL and SUPABASE_ANON_KEY in .env');
  
  // Mock client that won't crash the server
  supabase = {
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
} else {
  console.log('✅ Supabase configured with URL:', supabaseUrl);
  console.log('✅ Using key from', process.env.SUPABASE_ANON_KEY ? 'ANON' : 'SERVICE_ROLE');
  
  // Client with anon or service role key; avoid exposing service role to frontend
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };

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
