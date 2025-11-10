import { Request, Response } from 'express';
import { supabaseAuth } from '../supabase';

// Helper to check configuration state
const supabaseConfigured = !!process.env.SUPABASE_URL && !!process.env.SUPABASE_ANON_KEY;

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    if (!supabaseConfigured) {
      return res.status(503).json({ error: 'Auth service not configured (missing SUPABASE env vars)' });
    }

    console.log('Attempting to register user:', email);

    const { data, error } = await supabaseAuth.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: undefined }
    });

    if (error) {
      console.error('Supabase registration error:', error);
      return res.status(400).json({ error: error.message });
    }

    if (!data.user) {
      return res.status(400).json({ error: 'Failed to create user' });
    }

    console.log('User created successfully:', data.user.id);

    if (!data.session) {
      return res.status(201).json({
        message: 'Registration successful. Please confirm your email before logging in.',
        user: { id: data.user.id, email: data.user.email },
        emailConfirmationRequired: true
      });
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: data.user.id, email: data.user.email },
  token: data.session.access_token,
  // Include refresh token for consistency with login response
  refreshToken: data.session.refresh_token
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

    if (!supabaseConfigured) {
      return res.status(503).json({ error: 'Auth service not configured (missing SUPABASE env vars)' });
    }

    console.log('Attempting to login user:', email);

    const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password });

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
      user: { id: data.user.id, email: data.user.email },
      token: data.session.access_token,
      refreshToken: data.session.refresh_token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    if (!supabaseConfigured) {
      return res.status(503).json({ error: 'Auth service not configured (missing SUPABASE env vars)' });
    }

    const { data, error } = await supabaseAuth.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (error || !data.session) {
      console.error('Token refresh error:', error);
      return res.status(401).json({ 
        error: 'Invalid refresh token', 
        code: 'REFRESH_FAILED' 
      });
    }

    res.json({
      message: 'Token refreshed successfully',
      user: { id: data.user.id, email: data.user.email },
      token: data.session.access_token,
      refreshToken: data.session.refresh_token
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
