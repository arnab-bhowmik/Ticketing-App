import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest, NotFoundError, NotAuthorizedError, BadRequestError } from '@ticketing_org/custom-modules';
import { Ticket } from '../models/ticket';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { connection, exchange } from '../index';

const router = express.Router();            

router.put('/api/tickets/:id', requireAuth, [
    body('title')
        .notEmpty()
        .withMessage('Title is mandatory'),
    body('price')
        .notEmpty()
        .isFloat({ gt: 0 })
        .withMessage('Price is mandatory and must be greater than Zero!')
    ], 
    validateRequest, 
    async (req: Request, res: Response) => {
        const ticket = await Ticket.findById(req.params.id);
        // Throw error if the Ticket doesn't exist otherwise return the Ticket
        if (!ticket) {
            throw new NotFoundError();
        }
        // Check if Ticket is already reserved
        if (ticket.orderId) {
            throw new BadRequestError('Cannot edit a reserved ticket');
        }
        // Throw error if the user attempting the update isn't the Ticket Owner
        if (ticket.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }
        // Save the updated details to Mongo Collection
        ticket.set({
            title: req.body.title,
            price: req.body.price
        });
        await ticket.save();

        // Publish an event for Ticket Update
        await new TicketUpdatedPublisher(connection!,exchange).publish({
            id:      ticket.id,
            version: ticket.version,
            title:   ticket.title,
            price:   ticket.price,
            userId:  ticket.userId
        });

        res.status(200).send(ticket);
    }
);

export { router as updateTicketRouter };