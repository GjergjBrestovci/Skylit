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

    // Parse the generated_code JSON
    let parsedGeneratedCode = {};
    try {
      if (data.generated_code) {
        parsedGeneratedCode = JSON.parse(data.generated_code);
      }
    } catch (parseError) {
      console.warn('Failed to parse generated_code JSON:', parseError);
    }

    res.json({
      project: {
        id: data.id,
        title: data.title,
        prompt: data.prompt,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        ...parsedGeneratedCode
      }
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
