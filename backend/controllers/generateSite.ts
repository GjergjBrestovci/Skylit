import { Request, Response } from 'express';
import { enhancePrompt } from '../services/ai/promptEnhancer';
import { AuthRequest } from '../middleware/auth';
import { generateWebsiteFromPrompt } from '../services/ai/generateWebsite';

export const generateSite = async (req: AuthRequest, res: Response) => {
  const { prompt } = req.body as { prompt?: string };
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }
  try {
    const { enhanced } = await enhancePrompt(prompt);
    const aiResult = await generateWebsiteFromPrompt(enhanced);
    const timestamp = new Date().toISOString();

    return res.json({
      prompt,
      enhancedPrompt: enhanced,
      generated: aiResult.html, // keep existing key for backward compatibility
      css: aiResult.css,
      notes: aiResult.notes,
      model: aiResult.model,
      createdAt: timestamp,
      userId: req.userId
    });
  } catch (e) {
    console.error('generateSite error', e);
    return res.status(500).json({ error: 'Failed to generate site' });
  }
};
