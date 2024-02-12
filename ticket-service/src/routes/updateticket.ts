import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest, NotFoundError, NotAuthorizedError } from '@ticketing_org/custom-modules';
import { openRabbitMQConnection, closeRabbitMQConnection } from "@ticketing_org/custom-modules";
import { Ticket } from '../models/ticket';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';

const router = express.Router();

const rabbitmqUsername    = process.env.RABBITMQ_USERNAME!;
const rabbitmqPassword    = process.env.RABBITMQ_PASSWORD!;
const rabbitmqService     = process.env.RABBITMQ_SERVICE!;
const exchange            = process.env.RABBITMQ_EXCHANGE!;
const queue               = process.env.RABBITMQ_QUEUE!;            

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

        // Establish connection with RabbitMQ service for publishing Events. Keep the connection open.
        const connection = await openRabbitMQConnection(rabbitmqUsername,rabbitmqPassword,rabbitmqService);
        if (connection) {
            console.log('Successfully established connection to RabbitMQ Service');
            // Publish an event for Ticket Creation
            await new TicketUpdatedPublisher(connection!,exchange).publish({
                id: ticket.id,
                title: ticket.title,
                price: ticket.price,
                userId: ticket.userId
            }); 
            // await closeRabbitMQConnection(connection!);
        }

        res.status(200).send(ticket);
    }
);

export { router as updateTicketRouter };