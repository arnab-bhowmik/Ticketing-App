import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest } from '@ticketing_org/custom-modules';
import { Ticket } from '../models/ticket';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';

const router = express.Router();

const exchange                  = 'rabbitmq-exchange';
const key                       = 'ticket.created';
const rabbitmq_username         = 'example';
const rabbitmq_password         = 'whyareyoulookinghere';
const rabbitmq_k8s_service      = 'rabbitmq-cluster';
const rabbitmq_k8s_service_port = 5672;

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

        // Publish an event for Ticket Creation
        new TicketCreatedPublisher(exchange,key,rabbitmq_username,rabbitmq_password,rabbitmq_k8s_service,rabbitmq_k8s_service_port).publish({
            id:     ticket.id,
            title:  ticket.title,
            price:  ticket.price,
            userId: ticket.userId
        });

        res.status(201).send(ticket);
    }
);

export { router as createTicketRouter };