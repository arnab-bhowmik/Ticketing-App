import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { RequestValidationError } from '../errors/request-validation-errors';

const router = express.Router();

router.post('/api/users/signin', [
    body('email')
     .isEmail()
     .withMessage('Email must be valid'),
     body('password')
     .trim()
     .notEmpty()
     .withMessage('Password is mandatory!')
    ], (req: Request, res: Response) => {
        // Check for any Validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new RequestValidationError(errors.array());
        }
    }
);

export { router as signInRouter };