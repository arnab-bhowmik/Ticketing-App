import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest, NotFoundError, BadRequestError } from '@ticketing_org/custom-modules';
import { Ticket } from '../models/ticket';
import { Order, OrderStatus } from '../models/order';
import { razorpay } from '../services/razorpay';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { connection, exchange } from '../index';
import { sendEmail } from '../services/transporter';

const router = express.Router();

const EXPIRATION_WINDOW_SECS = 5*60;             

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
            throw new NotFoundError('Ticket Not Found');
        }
        // Ensure the Ticket is not already reserved as part of another Order
        const isReserved = await ticket.isReserved();
        if (isReserved) {
            throw new BadRequestError('Ticket is already reserved');
        }
        // Calculate Expiration Date for the Order
        const expiration = new Date();
        expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECS);

        // Send a request to RazorPay to create an Order internally to be linked with the Payment later
        console.log('Attempting to create a new Razorpay Order Id');
        const orderAmount = (ticket.price * 100);
        const rzpOrder = await razorpay.orders.create({
            amount: orderAmount,
            currency: 'INR',
            receipt: `Order_Receipt_${ticket.id}`
        });
        if (!rzpOrder) {
            throw new BadRequestError('Issues with Razorpay Order Id creation');
        }

        // Create the Order and save it to Database
        const order = Order.build({
            userId: req.currentUser!.id,
            userEmail: req.currentUser!.email,
            status: OrderStatus.Created,
            expiresAt: expiration,
            rzpOrderId: rzpOrder.id,
            ticket: ticket
        })
        await order.save();

        // Publish an event for Order Creation
        await new OrderCreatedPublisher(connection!,exchange).publish({
            id:         order.id,
            version:    order.version,
            userId:     order.userId,
            userEmail:  order.userEmail,
            status:     order.status,
            expiresAt:  order.expiresAt.toISOString(),
            rzpOrderId: order.rzpOrderId,
            ticket: {
                id:         ticket.id,
                title:      ticket.title,
                price:      ticket.price,
                userId:     ticket.userId,
                userEmail:  ticket.userEmail,
                version:    ticket.version
            }
        });

        // Send Email to User
        sendEmail(order.userEmail, `Order ${order.id} Created Successfully!`, `New Order created for purchase of Ticket with Title - ${ticket.title} & Price - ${ticket.price}`);

        res.status(201).send(order);
    }
);

export { router as createOrderRouter };