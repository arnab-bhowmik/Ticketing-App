import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { RequestValidationError } from '../errors/request-validation-errors';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
    
    // Check for any Validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new RequestValidationError(errors.array());
    }

    next();
};