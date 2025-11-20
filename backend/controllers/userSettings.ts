import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getUserSettings, updateUserSettings, UpdateSettingsInput } from '../services/userSettingsService';

export const fetchSettings = async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const settings = await getUserSettings(req.userId);
    return res.json(settings);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return res.status(500).json({ error: 'Failed to load settings' });
  }
};

export const saveSettings = async (req: AuthRequest, res: Response) => {
  if (!req.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const updates = req.body as UpdateSettingsInput;

  try {
    const settings = await updateUserSettings(req.userId, updates);
    return res.json(settings);
  } catch (error) {
    console.error('Error updating user settings:', error);
    return res.status(500).json({ error: 'Failed to update settings' });
  }
};
