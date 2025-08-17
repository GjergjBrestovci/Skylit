import { Request, Response, NextFunction } from 'express';
import { supabase as supabaseAuth } from '../supabase';

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

const supabaseConfigured = !!process.env.SUPABASE_URL && !!process.env.SUPABASE_ANON_KEY;

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  if (!supabaseConfigured) {
    return res.status(503).json({ error: 'Auth not configured (missing SUPABASE env vars)' });
  }

  try {
    const { data: { user }, error } = await supabaseAuth.auth.getUser(token);

    if (error || !user) {
      console.error('Auth verification error:', error);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.userId = user.id;
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};
