  import { Request, Response, NextFunction } from 'express';
import { supabase as supabaseAuth } from '../supabase';

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

const supabaseConfigured = !!process.env.SUPABASE_URL && !!process.env.SUPABASE_ANON_KEY;
// Only bypass when explicitly enabled
const devBypass = process.env.AUTH_BYPASS === 'true';

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  // Expect standard: Authorization: Bearer <token>
  const parts = authHeader ? authHeader.split(' ') : [];
  const scheme = parts[0];
  const token = parts[1];

  // Optional dev bypass (explicit opt-in)
  if (devBypass) {
    req.userId = (req.headers['x-dev-user-id'] as string) || 'dev-user';
    req.user = { id: req.userId, email: 'dev@example.com' };
    return next();
  }

  if (!token) {
    return res.status(401).json({ error: 'Access token required', code: 'NO_TOKEN' });
  }
  if (scheme !== 'Bearer') {
    return res.status(400).json({ error: 'Malformed authorization header', code: 'BAD_AUTH_HEADER' });
  }
  if (!supabaseConfigured) {
    return res.status(503).json({ error: 'Auth not configured (missing SUPABASE env vars)' });
  }

  try {
    // Proactive local expiration check to avoid unnecessary Supabase call
    try {
      const payloadBase64 = token.split('.')[1];
      if (payloadBase64) {
        const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf8');
        const payload = JSON.parse(payloadJson);
        if (payload?.exp && Date.now() / 1000 >= payload.exp) {
          return res.status(401).json({
            error: 'Token has expired',
            code: 'TOKEN_EXPIRED',
            message: 'Please refresh session'
          });
        }
      }
    } catch (_) {
      // Ignore decoding issues; fallback to remote validation
    }

    const { data: { user }, error } = await supabaseAuth.auth.getUser(token);

    if (error || !user) {
      console.error('Auth verification error:', error);
      
      // Check if it's specifically a token expiration error
      if ((error as any)?.message?.includes('expired') || (error as any)?.code === 'bad_jwt') {
        return res.status(401).json({ 
          error: 'Token has expired', 
          code: 'TOKEN_EXPIRED',
          message: 'Please log in again'
        });
      }
      
      return res.status(403).json({
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      });
    }

    req.userId = user.id;
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(403).json({
      error: 'Invalid or expired token',
      code: 'AUTH_ERROR'
    });
  }
};
