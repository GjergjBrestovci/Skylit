import { Request, Response } from 'express';
import { enhancePrompt } from '../services/ai/promptEnhancer';
import { AuthRequest } from '../middleware/auth';
import { generateWebsiteFromPrompt } from '../services/ai/generateWebsite';
import { storePreview } from './previewSite';
import { consumeCredit, getCredits } from '../services/credits';

export const generateSite = async (req: AuthRequest, res: Response) => {
  const { prompt, techStack } = req.body as { prompt?: string; techStack?: string };
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }
  
  try {
    // Check user credits before proceeding
    const { credits } = getCredits(req.userId!);
    if (credits < 1) {
      return res.status(402).json({ error: 'Insufficient credits', code: 'NO_CREDITS' });
    }
    
    console.log('🔄 Enhancing user prompt...');
    const promptResult = await enhancePrompt(prompt);
    
    console.log('🤖 Generating website with enhanced prompt...');
    const aiResult = await generateWebsiteFromPrompt(promptResult.enhanced, techStack || 'vanilla');
    const timestamp = new Date().toISOString();

    // Store preview for live viewing
    const previewId = storePreview(req.userId!, aiResult.html, aiResult.css, aiResult.javascript);

  console.log('✅ Website generated successfully');

  // Consume one credit on success
  consumeCredit(req.userId!);

  return res.json({
      prompt,
      enhancedPrompt: promptResult.enhanced,
      analysis: promptResult.analysis,
      requirements: promptResult.requirements,
      generated: aiResult.html, // keep existing key for backward compatibility
      html: aiResult.html,
      css: aiResult.css,
      javascript: aiResult.javascript,
      notes: aiResult.notes,
      model: aiResult.model,
      createdAt: timestamp,
      userId: req.userId,
      previewId: previewId,
      previewUrl: `/api/preview/${previewId}`,
      enhancementUsedAI: promptResult.usedKey
  });
  } catch (e) {
    console.error('generateSite error', e);
    return res.status(500).json({ error: 'Failed to generate site' });
  }
};
