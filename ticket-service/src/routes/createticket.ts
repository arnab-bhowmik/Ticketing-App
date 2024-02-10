import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest } from '@ticketing_org/custom-modules';
import { openRabbitMQConnection, closeRabbitMQConnection } from "@ticketing_org/custom-modules";
import { Ticket } from '../models/ticket';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';

const router = express.Router();

const exchange            = 'rabbitmq-exchange';
const routingKey          = 'ticket.created';
const rabbitmqUsername    = 'example';
const rabbitmqPassword    = 'whyareyoulookinghere';
const rabbitmqService     = 'rabbitmq-cluster';
const rabbitmqServicePort = 5672;

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

        // Establish connection with RabbitMQ service for publishing Events. Keep the connection open.
        const connection = await openRabbitMQConnection(rabbitmqUsername,rabbitmqPassword,rabbitmqService,rabbitmqServicePort);
        if (connection) {
            console.log('Successfully established connection to RabbitMQ Service');
            // Publish an event for Ticket Creation
            await new TicketCreatedPublisher(connection!,exchange,routingKey).publish({
                id:     ticket.id,
                title:  ticket.title,
                price:  ticket.price,
                userId: ticket.userId
            }); 
            // await closeRabbitMQConnection(connection!);
        }

        res.status(201).send(ticket);
    }
);

export { router as createTicketRouter };