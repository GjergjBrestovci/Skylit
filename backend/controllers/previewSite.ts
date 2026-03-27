import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { supabase } from '../supabase';

// In-memory fallback for development / when Supabase previews table doesn't exist
const memoryStorage = new Map<string, { html: string; css: string; javascript: string; createdAt: number; userId?: string }>();
let useMemoryFallback = false;

const PREVIEW_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Store a preview. Tries Supabase first, falls back to in-memory.
 */
export const storePreview = async (userId: string, html: string, css: string, javascript: string = ''): Promise<string> => {
  const previewId = `${userId.slice(0, 8)}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  if (!useMemoryFallback) {
    try {
      const expiresAt = new Date(Date.now() + PREVIEW_TTL_MS).toISOString();
      const { error } = await supabase.from('previews').insert({
        id: previewId,
        user_id: userId,
        html,
        css,
        javascript,
        expires_at: expiresAt
      });

      if (error) {
        // Table likely doesn't exist - fall back to memory
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.warn('Previews table not found, using in-memory storage');
          useMemoryFallback = true;
        } else {
          throw error;
        }
      } else {
        // Cleanup expired previews in background (non-blocking)
        supabase.from('previews').delete().lt('expires_at', new Date().toISOString()).then(() => {});
        return previewId;
      }
    } catch (err) {
      console.warn('Supabase preview storage failed, using in-memory fallback:', err);
      useMemoryFallback = true;
    }
  }

  // In-memory fallback
  memoryStorage.set(previewId, { html, css, javascript, createdAt: Date.now(), userId });

  // Clean up expired in-memory previews
  const cutoff = Date.now() - PREVIEW_TTL_MS;
  for (const [id, data] of memoryStorage.entries()) {
    if (data.createdAt < cutoff) memoryStorage.delete(id);
  }

  return previewId;
};

/**
 * Serve a preview as HTML.
 */
export const getPreview = async (req: Request, res: Response) => {
  const { previewId } = req.params;

  if (!previewId) {
    return res.status(400).json({ error: 'Preview ID is required' });
  }

  let preview: { html: string; css: string; javascript: string } | null = null;

  // Try Supabase first
  if (!useMemoryFallback) {
    try {
      const { data, error } = await supabase
        .from('previews')
        .select('html, css, javascript, expires_at')
        .eq('id', previewId)
        .single();

      if (!error && data) {
        // Check expiry
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          supabase.from('previews').delete().eq('id', previewId).then(() => {});
          return res.status(404).json({ error: 'Preview expired' });
        }
        preview = { html: data.html, css: data.css, javascript: data.javascript };
      }
    } catch {
      // Fall through to memory
    }
  }

  // Try in-memory
  if (!preview) {
    const memPreview = memoryStorage.get(previewId);
    if (memPreview) {
      if (Date.now() - memPreview.createdAt > PREVIEW_TTL_MS) {
        memoryStorage.delete(previewId);
        return res.status(404).json({ error: 'Preview expired' });
      }
      preview = { html: memPreview.html, css: memPreview.css, javascript: memPreview.javascript };
    }
  }

  if (!preview) {
    return res.status(404).json({ error: 'Preview not found or expired' });
  }

  // Build full HTML with injected CSS and JS
  let fullHtml = preview.html;

  if (preview.css) {
    if (fullHtml.includes('</head>')) {
      fullHtml = fullHtml.replace('</head>', `<style>${preview.css}</style></head>`);
    } else if (fullHtml.includes('<head>')) {
      fullHtml = fullHtml.replace('<head>', `<head><style>${preview.css}</style>`);
    } else {
      fullHtml = `<style>${preview.css}</style>` + fullHtml;
    }
  }

  if (preview.javascript) {
    if (fullHtml.includes('</body>')) {
      fullHtml = fullHtml.replace('</body>', `<script>${preview.javascript}</script></body>`);
    } else if (fullHtml.includes('</html>')) {
      fullHtml = fullHtml.replace('</html>', `<script>${preview.javascript}</script></html>`);
    } else {
      fullHtml += `<script>${preview.javascript}</script>`;
    }
  }

  // Security headers for preview
  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  const origins: string[] = [];
  if (process.env.FRONTEND_URL) origins.push(process.env.FRONTEND_URL);
  if (process.env.DEV_ORIGINS) origins.push(...process.env.DEV_ORIGINS.split(',').map(s => s.trim()).filter(Boolean));
  const csp = ["frame-ancestors 'self'", ...origins].join(' ');
  res.setHeader('Content-Security-Policy', csp);
  res.setHeader('X-Content-Type-Options', 'nosniff');

  res.send(fullHtml);
};

export const deletePreview = async (req: AuthRequest, res: Response) => {
  const { previewId } = req.params;

  if (!previewId) {
    return res.status(400).json({ error: 'Preview ID is required' });
  }

  let deleted = false;

  // Try Supabase
  if (!useMemoryFallback) {
    try {
      const { error } = await supabase.from('previews').delete().eq('id', previewId);
      if (!error) deleted = true;
    } catch { /* fall through */ }
  }

  // Try in-memory
  if (!deleted) {
    deleted = memoryStorage.delete(previewId);
  }

  if (!deleted) {
    return res.status(404).json({ error: 'Preview not found' });
  }

  res.json({ success: true, message: 'Preview deleted successfully' });
};
