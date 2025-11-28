import { Response } from 'express';
import { supabase } from '../supabase';
import { AuthRequest } from '../middleware/auth';
import { isValidUUID } from '../utils/isValidUUID';

export const saveProject = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      title,
      name, // backwards compatibility
      prompt, 
      enhanced_prompt,
      preview_url,
      preview_id,
      tech_stack,
      website_type,
      model,
      generated_code 
    } = req.body;
    const userId = req.userId;

    // Use title or fall back to name for backwards compatibility
    const projectTitle = title || name;

    if (!projectTitle || !userId) {
      return res.status(400).json({ error: 'Title and user authentication required' });
    }

    // In dev bypass we may not have a real Supabase user id. Avoid hitting the DB with invalid UUIDs.
    if (!isValidUUID(userId)) {
      const now = new Date().toISOString();
      const mockProject = {
        id: `dev-${Date.now()}`,
        title: projectTitle,
        prompt,
        enhanced_prompt,
        preview_url,
        preview_id,
        tech_stack: tech_stack || 'vanilla',
        website_type,
        model,
        created_at: now,
        updated_at: now
      };

      return res.status(201).json({
        message: 'Project captured in dev mode (not persisted). Set DEV_SUPABASE_USER_ID to interact with Supabase.',
        project: mockProject
      });
    }

    // Parse generated_code to extract individual fields
    let parsedData: any = {};
    try {
      if (generated_code && typeof generated_code === 'string') {
        parsedData = JSON.parse(generated_code);
      } else if (generated_code && typeof generated_code === 'object') {
        parsedData = generated_code;
      }
    } catch (parseError) {
      console.warn('Failed to parse generated_code:', parseError);
    }

    // Insert project into Supabase
    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          user_id: userId,
          title: projectTitle,
          prompt,
          enhanced_prompt: enhanced_prompt || parsedData.enhancedPrompt || null,
          generated_code: typeof generated_code === 'string' ? generated_code : JSON.stringify(generated_code || {}),
          html: parsedData.html || null,
          css: parsedData.css || null,
          javascript: parsedData.javascript || null,
          preview_url: preview_url || parsedData.previewUrl || null,
          preview_id: preview_id || null,
          model: model || parsedData.model || null,
          tech_stack: tech_stack || parsedData.config?.techStack || 'vanilla',
          website_type: website_type || parsedData.config?.websiteType || null,
          theme: parsedData.config?.theme || null,
          primary_color: parsedData.config?.primaryColor || null,
          accent_color: parsedData.config?.accentColor || null,
          design_style: parsedData.config?.designStyle || null,
          layout: parsedData.config?.layout || null,
          pages: parsedData.config?.pages || null,
          features: parsedData.config?.features || null
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to save project' });
    }

    res.status(201).json({
      message: 'Project saved successfully',
      project: data
    });
  } catch (error) {
    console.error('Save project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
