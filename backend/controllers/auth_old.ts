import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

// Create a client with anon key for auth operations
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    console.log('Attempting to register user:', email);

    // Use signUp instead of admin.createUser
    const { data, error } = await supabaseAuth.auth.signUp({
      email,
      password
    });

    if (error) {
      console.error('Supabase registration error:', error);
      return res.status(400).json({ error: error.message });
    }

    if (!data.user) {
      return res.status(400).json({ error: 'Failed to create user' });
    }

    console.log('User created successfully:', data.user.id);

    // Return the session token if available
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: data.user.id,
        email: data.user.email
      },
      token: data.session?.access_token || 'registration_pending'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    console.log('Attempting to login user:', email);

    // Sign in with Supabase Auth using anon key
    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Supabase login error:', error);
      return res.status(401).json({ error: error.message });
    }

    if (!data.user || !data.session) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Login successful:', data.user.id);

    res.json({
      message: 'Login successful',
      user: {
        id: data.user.id,
        email: data.user.email
      },
      token: data.session.access_token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Duplicate login function removed to fix redeclaration error.
