import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';

// Store generated websites in memory for preview (in production, use database or file storage)
const previewStorage = new Map<string, { html: string; css: string; javascript: string; createdAt: number }>();

export const storePreview = (userId: string, html: string, css: string, javascript: string = ''): string => {
  const previewId = `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  previewStorage.set(previewId, {
    html,
    css,
    javascript,
    createdAt: Date.now()
  });
  
  // Clean up old previews (older than 1 hour)
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  for (const [id, data] of previewStorage.entries()) {
    if (data.createdAt < oneHourAgo) {
      previewStorage.delete(id);
    }
  }
  
  return previewId;
};

export const getPreview = (req: Request, res: Response) => {
  const { previewId } = req.params;
  
  if (!previewId) {
    return res.status(400).json({ error: 'Preview ID is required' });
  }
  
  const preview = previewStorage.get(previewId);
  if (!preview) {
    return res.status(404).json({ error: 'Preview not found or expired' });
  }
  
  // Inject CSS and JavaScript into HTML
  let fullHtml = preview.html;
  
  // Add CSS if present
  if (preview.css) {
    // Check if there's already a <style> tag or <head> section
    if (fullHtml.includes('<head>')) {
      fullHtml = fullHtml.replace('</head>', `<style>${preview.css}</style></head>`);
    } else {
      // Add a basic head section with CSS
      fullHtml = fullHtml.replace('<html>', `<html><head><style>${preview.css}</style></head>`);
    }
  }
  
  // Add JavaScript if present
  if (preview.javascript) {
    // Try to inject before closing body tag first, then before closing html tag
    if (fullHtml.includes('</body>')) {
      fullHtml = fullHtml.replace('</body>', `<script>${preview.javascript}</script></body>`);
    } else if (fullHtml.includes('</html>')) {
      fullHtml = fullHtml.replace('</html>', `<script>${preview.javascript}</script></html>`);
    } else {
      // Append at the end
      fullHtml += `<script>${preview.javascript}</script>`;
    }
  }
  
  // Set appropriate headers for HTML content
  res.setHeader('Content-Type', 'text/html');
  
  // Remove X-Frame-Options to allow iframe embedding
  // Use Content-Security-Policy for more modern and flexible control
  res.setHeader('Content-Security-Policy', "frame-ancestors 'self' http://localhost:* https://localhost:*");
  
  // Allow cross-origin requests for preview (needed for different ports)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  res.send(fullHtml);
};

export const deletePreview = (req: AuthRequest, res: Response) => {
  const { previewId } = req.params;
  
  if (!previewId) {
    return res.status(400).json({ error: 'Preview ID is required' });
  }
  
  const deleted = previewStorage.delete(previewId);
  
  if (!deleted) {
    return res.status(404).json({ error: 'Preview not found' });
  }
  
  res.json({ success: true, message: 'Preview deleted successfully' });
};
