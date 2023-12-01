import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest, BadRequestError } from '@ticketing_org/custom-modules';
import { Ticket } from '../models/ticket';

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
    async (req: Request, res: Response) => {
        const { title, price } = req.body;
        const ticket = Ticket.build({
            title,
            price,
            userId: req.currentUser!.id
        });
        await ticket.save();
        res.status(201).send(ticket);
    }
);

export { router as createTicketRouter };