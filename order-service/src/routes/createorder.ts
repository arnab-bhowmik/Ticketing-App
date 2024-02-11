import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest, NotFoundError, BadRequestError } from '@ticketing_org/custom-modules';
import { openRabbitMQConnection, closeRabbitMQConnection } from "@ticketing_org/custom-modules";
import { Ticket } from '../models/ticket';
import { Order, OrderStatus } from '../models/order';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';

const router = express.Router();

const EXPIRATION_WINDOW_SECS = 5*60;

const exchange            = 'rabbitmq-exchange';
const routingKey          = 'order.created';
const rabbitmqUsername    = 'example';
const rabbitmqPassword    = 'whyareyoulookinghere';
const rabbitmqService     = 'rabbitmq-cluster';
const rabbitmqServicePort = 5672;

router.post('/api/orders', requireAuth, [
    body('ticketId')
     .notEmpty()
     .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
     .withMessage('Ticket Id is mandatory')
    ], 
    // Check for any Validation errors
    validateRequest,
    async (req: Request, res: Response) => {
        const { ticketId } = req.body;
        // Find the ticket the User is trying to buy
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            throw new NotFoundError();
        }
        // Ensure the Ticket is not already reserved as part of another Order
        const isReserved = await ticket.isReserved();
        if (isReserved) {
            throw new BadRequestError('Ticket is already reserved');
        }
        // Calculate Expiration Date for the Order
        const expiration = new Date();
        expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECS);
        // Create the Order and save it to Database
        const order = Order.build({
            userId: req.currentUser!.id,
            status: OrderStatus.Created,
            expiresAt: expiration,
            ticket: ticket
        })
        await order.save();

        // Establish connection with RabbitMQ service for publishing Events. Keep the connection open.
        const connection = await openRabbitMQConnection(rabbitmqUsername,rabbitmqPassword,rabbitmqService,rabbitmqServicePort);
        if (connection) {
            console.log('Successfully established connection to RabbitMQ Service');
            // Publish an event for Order Creation
            await new OrderCreatedPublisher(connection!,exchange,routingKey).publish({
                id:         order.id,
                userId:     order.userId,
                status:     order.status,
                expiresAt:  order.expiresAt.toISOString(),
                ticket: {
                    id:     ticket.id,
                    price:  ticket.price
                }
            });
            // await closeRabbitMQConnection(connection!); 
        }         

        res.status(201).send(order);
    }
);

export { router as createOrderRouter };