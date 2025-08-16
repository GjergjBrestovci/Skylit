import { Request, Response } from 'express';
import { enhancePrompt } from '../services/ai/promptEnhancer';
import { AuthRequest } from '../middleware/auth';

export const generateSite = async (req: AuthRequest, res: Response) => {
  const { prompt } = req.body as { prompt?: string };
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }
  try {
    const { enhanced } = await enhancePrompt(prompt);
    const timestamp = new Date().toISOString();
    const mockCode = `<!-- Generated at ${timestamp} -->\n<html><head><title>${enhanced.slice(0,40)}</title></head><body><h1>${enhanced}</h1><p>Generated placeholder.</p></body></html>`;
    return res.json({ 
      prompt, 
      enhancedPrompt: enhanced, 
      generated: mockCode, 
      createdAt: timestamp,
      userId: req.userId 
    });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to enhance prompt' });
  }
};
