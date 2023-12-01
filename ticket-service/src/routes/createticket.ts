import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest, BadRequestError } from '@ticketing_org/custom-modules';

const router = express.Router();

router.post('/api/tickets', requireAuth, [
    body('title')
     .notEmpty()
     .withMessage('Title is mandatory'),
     body('price')
     .notEmpty()
     .isFloat({ gt: 0 })
     .withMessage('Price is mandatory and must be greater than Zero!')
    ], 
    // Check for any Validation errors
    validateRequest,
    (req: Request, res: Response) => {
    res.sendStatus(200);
});

export { router as createTicketRouter };