import { Response } from 'express';
import { supabase } from '../supabase';
import { AuthRequest } from '../middleware/auth';

export const getProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    // Fetch specific project from Supabase (with RLS ensuring user can only access their own projects)
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Database error:', error);
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Project not found' });
      }
      return res.status(500).json({ error: 'Failed to fetch project' });
    }

    // Parse the generated_code JSON to extract additional data
    let parsedGeneratedCode: any = {};
    try {
      if (data.generated_code) {
        parsedGeneratedCode = typeof data.generated_code === 'string' 
          ? JSON.parse(data.generated_code) 
          : data.generated_code;
      }
    } catch (parseError) {
      console.warn('Failed to parse generated_code JSON:', parseError);
    }

    // Build config object from stored fields or parsed generated_code
    const config = parsedGeneratedCode.config || {
      websiteType: data.website_type || '',
      theme: data.theme || '',
      primaryColor: data.primary_color || '#3B82F6',
      accentColor: data.accent_color || '#10B981',
      designStyle: data.design_style || '',
      layout: data.layout || '',
      pages: data.pages || [],
      features: data.features || [],
      additionalDetails: '',
      techStack: data.tech_stack || 'vanilla'
    };

    res.json({
      project: {
        id: data.id,
        title: data.title,
        prompt: data.prompt,
        enhancedPrompt: data.enhanced_prompt || parsedGeneratedCode.enhancedPrompt,
        html: data.html || parsedGeneratedCode.html,
        css: data.css || parsedGeneratedCode.css,
        javascript: data.javascript || parsedGeneratedCode.javascript,
        previewUrl: data.preview_url || parsedGeneratedCode.previewUrl,
        previewId: data.preview_id,
        model: data.model || parsedGeneratedCode.model,
        techStack: data.tech_stack || config.techStack,
        websiteType: data.website_type || config.websiteType,
        analysis: parsedGeneratedCode.analysis,
        requirements: parsedGeneratedCode.requirements || [],
        notes: parsedGeneratedCode.notes,
        enhancementUsedAI: parsedGeneratedCode.enhancementUsedAI || false,
        config,
        isFavorite: data.is_favorite,
        isArchived: data.is_archived,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
