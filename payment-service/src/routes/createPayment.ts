import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest, BadRequestError, NotFoundError, NotAuthorizedError, OrderStatus } from '@ticketing_org/custom-modules';
import { Order } from '../models/order';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { connection, exchange } from '../index';

const router = express.Router();             

router.post('/api/payments', requireAuth, [
    body('token')
     .notEmpty()
     .withMessage('Token is mandatory'),
     body('orderId')
     .notEmpty()
     .withMessage('Order Id is mandatory')
    ], 
    // Check for any Validation errors
    validateRequest,
    async (req: Request, res: Response) => {
        // Look up the Order if it exists
        const { token, orderId } = req.body;
        const order = await Order.findById(orderId);
        if (!order) {
            throw new NotFoundError();
        }
        // Check if the user initiating payment is the one who created the Order
        if (order.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }
        // Check if the Order isn't Cancelled
        if (order.status === OrderStatus.Cancelled) {
            throw new BadRequestError('Cannot pay for an Cancelled Order');
        }

        // // Publish an event for Ticket Creation
        // await new TicketCreatedPublisher(connection!,exchange).publish({
        //     id:      ticket.id,
        //     version: ticket.version,
        //     title:   ticket.title,
        //     price:   ticket.price,
        //     userId:  ticket.userId
        // });

        res.status(201).send({success: true});
    }   
);

export { router as createPaymentRouter };