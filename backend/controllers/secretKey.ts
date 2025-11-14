  import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { validateSecretKey, getCredits } from '../services/credits';

export const setUserSecretKey = async (req: AuthRequest, res: Response) => {
  const { secretKey } = req.body;
  
  if (!secretKey) {
    return res.status(400).json({ error: 'Secret key is required' });
  }

  if (!req.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const isValid = await validateSecretKey(req.userId, secretKey);
    
    if (!isValid) {
      return res.status(400).json({ 
        error: 'Invalid secret key',
        success: false
      });
    }

    // Get updated credits to return to user
    const userCredits = await getCredits(req.userId);

    return res.json({
      success: true,
      message: 'Secret key validated and unlimited credits activated',
      credits: userCredits.credits,
      hasUnlimitedCredits: userCredits.hasUnlimitedCredits
    });
  } catch (error) {
    console.error('Error setting secret key:', error);
    return res.status(500).json({ error: 'Failed to set secret key' });
  }
};
