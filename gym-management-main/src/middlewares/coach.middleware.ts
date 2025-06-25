import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

export const validateCoachId = (req: Request, res: Response, next: NextFunction): void => {
  const { coachId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(coachId)) {
    res.status(400).json({ message: 'Invalid coach ID format' });
    return;
  }

  next();
};