import { Response } from 'express';
import { supabase } from '../supabase';
import { AuthRequest } from '../middleware/auth';

export const saveProject = async (req: AuthRequest, res: Response) => {
  try {
    const { title, prompt, generated_code } = req.body;
    const userId = req.userId;

    if (!title || !userId) {
      return res.status(400).json({ error: 'Title and user authentication required' });
    }

    // Insert project into Supabase
    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          user_id: userId,
          title,
          prompt,
          generated_code
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
