import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest, BadRequestError, NotFoundError, NotAuthorizedError, OrderStatus } from '@ticketing_org/custom-modules';
import { stripe } from '../stripe';
import { Order } from '../models/order';
import { Payment } from '../models/payment';
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

        // Invoke Stripe API for the Payment. Note:- This is not supported in India!
        const charge = await stripe.charges.create({
            currency: 'usd',
            amount: order.price*100,
            source: token
        });
        // Build the Payment record
        const payment = Payment.build({
            stripeId: charge.id,
            orderId,
            version: 0
        });
        await payment.save();

        // Publish an event for Payment Creation
        await new PaymentCreatedPublisher(connection!,exchange).publish({
            id:         payment.id,
            stripeId:   payment.stripeId,
            orderId:    payment.orderId,
            version:    payment.version
        });

        res.status(201).send({success: true});
    }   
);

export { router as createPaymentRouter };