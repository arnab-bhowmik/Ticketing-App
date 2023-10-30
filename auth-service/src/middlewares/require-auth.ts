import { Request, Response, NextFunction } from 'express';
import { currentUser } from '../middlewares/current-user';
import { NotAuthorizedError } from '../errors/not-authorized-errors';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    
    // Check if User is logged In
    if (!req.currentUser) {
        throw new NotAuthorizedError();
    }

    next();
};