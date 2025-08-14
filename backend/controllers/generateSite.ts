import { Request, Response } from 'express';

export const generateSite = (req: Request, res: Response) => {
  res.json({ message: 'Site generation logic placeholder' });
};
