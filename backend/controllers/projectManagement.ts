import { Response } from 'express';
import { supabase } from '../supabase';
import { AuthRequest } from '../middleware/auth';

// Update project (rename, add description, star/archive)
export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const { name, description, starred, archived } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    // Validate project exists and belongs to user
    const { data: existingProject, error: fetchError } = await supabase
      .from('projects')
      .select('id, title')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Update project
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (name !== undefined) updateData.title = name;
    if (description !== undefined) updateData.description = description;
    if (starred !== undefined) updateData.starred = starred;
    if (archived !== undefined) updateData.archived = archived;

    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to update project' });
    }

    res.json({
      message: 'Project updated successfully',
      project: {
        id: data.id,
        name: data.title,
        description: data.description,
        starred: data.starred,
        archived: data.archived,
        updatedAt: data.updated_at
      }
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
};

// Delete project
export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    // Validate project exists and belongs to user
    const { data: existingProject, error: fetchError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Delete project
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', userId);

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to delete project' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
};

// Duplicate project
export const duplicateProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const { name } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    // Fetch original project
    const { data: originalProject, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !originalProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Create duplicate
    const duplicateData = {
      user_id: userId,
      title: name || `${originalProject.title} (Copy)`,
      description: originalProject.description,
      prompt: originalProject.prompt,
      html: originalProject.html,
      css: originalProject.css,
      javascript: originalProject.javascript,
      metadata: originalProject.metadata,
      tech_stack: originalProject.tech_stack,
      starred: false,
      archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('projects')
      .insert(duplicateData)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ error: 'Failed to duplicate project' });
    }

    res.status(201).json({
      message: 'Project duplicated successfully',
      project: {
        id: data.id,
        name: data.title,
        description: data.description,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    });
  } catch (error) {
    console.error('Duplicate project error:', error);
    res.status(500).json({ error: 'Failed to duplicate project' });
  }
};

// Get project history/versions (future enhancement)
export const getProjectHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    // For now, return empty history - this would be implemented with a project_versions table
    res.json({
      projectId,
      history: [],
      message: 'Version history feature coming soon'
    });
  } catch (error) {
    console.error('Get project history error:', error);
    res.status(500).json({ error: 'Failed to fetch project history' });
  }
};
