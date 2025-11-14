import { Response } from 'express';
import { supabase } from '../supabase';
import { AuthRequest } from '../middleware/auth';
import { isValidUUID } from '../utils/isValidUUID';

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    if (!isValidUUID(userId)) {
      console.warn(`[Projects] Non-UUID user id "${userId}" detected in dev bypass. Returning empty project list.`);
      return res.json({ projects: [] });
    }

    // Fetch user's projects from Supabase
    const { data, error } = await supabase
      .from('projects')
      .select('id, title, prompt, preview_url, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      if ((error as any)?.code === 'PGRST205') {
        // Table missing in dev: return empty list gracefully
        return res.json({ projects: [] });
      }
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to fetch projects' });
    }

    // Transform data to match frontend expectations
    const projects = (data || []).map((project: any) => ({
      id: project.id,
      name: project.title,
      createdAt: project.created_at,
      previewUrl: project.preview_url,
      previewId: project.preview_url ? project.preview_url.split('/').pop() : undefined
    }));

    res.json({
      projects
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
