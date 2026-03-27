import { Request, Response } from 'express';
import { enhancePrompt } from '../services/ai/promptEnhancer';
import { AuthRequest } from '../middleware/auth';
import { generateWebsiteFromPrompt } from '../services/ai/generateWebsite';
import { storePreview } from './previewSite';
import { consumeCredit, getCredits } from '../services/credits';

export const generateSite = async (req: AuthRequest, res: Response) => {
  const { prompt, techStack } = req.body;
  
  try {
    // Check user credits before proceeding
    const creditResult = await getCredits(req.userId!);
    
    // Allow generation if user has unlimited credits or has credits remaining
    if (!creditResult || (!creditResult.hasUnlimitedCredits && creditResult.credits < 1)) {
      console.log(`[generateSite] User ${req.userId} has insufficient credits:`, creditResult);
      return res.status(402).json({ 
        error: 'Insufficient credits to generate website', 
        code: 'NO_CREDITS',
        credits: creditResult?.credits || 0
      });
    }

    console.log(`[generateSite] User ${req.userId} has ${creditResult.hasUnlimitedCredits ? 'unlimited' : creditResult.credits} credits`);

    const useMock = process.env.MOCK_AI === 'true';
    let promptResult: any;
    let aiResult: any;
    const timestamp = new Date().toISOString();

    if (useMock) {
      console.log('⚙️ MOCK_AI enabled: generating stub website fast');
      promptResult = {
        enhanced: `${prompt} (enhanced)`,
        analysis: 'Mock analysis of the prompt',
        requirements: ['Responsive', 'CTA', 'Dark theme'],
        usedKey: false
      };
      aiResult = {
        html: `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Mock Site</title></head><body><main><h1>Mock ${techStack?.framework || techStack || 'vanilla'} Site</h1><p>${prompt}</p><a href="#" class="btn">Call to Action</a></main></body></html>`,
        css: 'body{font-family:system-ui;background:#0b0b0f;color:#e5e7eb}main{max-width:800px;margin:4rem auto;padding:1rem}a.btn{display:inline-block;margin-top:1rem;padding:.6rem 1rem;background:#06b6d4;color:#000;border-radius:.5rem}',
        javascript: 'console.log("Mock site ready")',
        notes: 'This is mock content for local testing',
        model: 'mock-local'
      };
    } else {
      console.log('🔄 Enhancing user prompt...');
      promptResult = await enhancePrompt(prompt);
      console.log('🤖 Generating website with enhanced prompt...');
      aiResult = await generateWebsiteFromPrompt(promptResult.enhanced, techStack?.framework || techStack || 'vanilla');
    }

    // Store preview for live viewing
  const previewId = await storePreview(req.userId!, aiResult.html, aiResult.css, aiResult.javascript);

    console.log('✅ Website generated successfully');

    // Consume one credit on success
    const creditConsumed = await consumeCredit(req.userId!);
    if (!creditConsumed) {
      console.warn('Failed to consume credit for user:', req.userId);
      // Still return the result but log the issue
    }

    // Get updated credit count
    const updatedCredits = await getCredits(req.userId!);

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
        enhancementUsedAI: promptResult.usedKey,
        creditsRemaining: updatedCredits?.credits || 0
    });
  } catch (e) {
    console.error('generateSite error', e);
    return res.status(500).json({ error: 'Failed to generate site' });
  }
};
