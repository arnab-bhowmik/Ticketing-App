import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest, BadRequestError, NotFoundError, NotAuthorizedError } from '@ticketing_org/custom-modules';
import { Order, OrderStatus } from '../models/order';
// import { stripe } from '../services/stripe';
// import { Payment } from '../models/payment-stripe';
import { razorpay } from '../services/razorpay';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { connection, exchange } from '../index';
import { sendEmail } from '../services/transporter';

const router = express.Router();             

router.post('/api/payments', requireAuth, [
    body('razorpayOrderId')
     .notEmpty()
     .withMessage('Razorpay Order Id is mandatory'),
    body('razorpayPaymentId')
     .notEmpty()
     .withMessage('Razorpay Payment Id is mandatory'),
    body('orderId')
     .notEmpty()
     .withMessage('Order Id is mandatory')
    ], 
    // Check for any Validation errors
    validateRequest,
    async (req: Request, res: Response) => {
        // Look up the Order if it exists
        const { razorpayOrderId, razorpayPaymentId, orderId } = req.body;     
        const order = await Order.findById(orderId).populate('ticket');
        if (!order) {
            throw new NotFoundError('Order Not Found');
        }
        // Check if the user initiating payment is the one who created the Order
        if (order.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }
        // Check if the Order isn't Cancelled
        if (order.status === OrderStatus.Cancelled) {
            throw new BadRequestError('Cannot pay for an Cancelled Order');
        }

        // ----------------- Following setion commented out as payments via Stripe aren't supported in India ----------------- //
        // // Invoke Stripe API for the Payment. Note:- This is not supported in India!
        // const charge = await stripe.charges.create({
        //     currency: 'usd',
        //     amount: order.price*100,
        //     source: token
        // });
        
        // // Build the Payment record
        // const payment = Payment.build({
        //     stripeId: charge.id,
        //     orderId,
        //     version: 0
        // });
        // await payment.save();

        // // Publish an event for Payment Creation
        // await new PaymentCreatedPublisher(connection!,exchange).publish({
        //     id:         payment.id,
        //     stripeId:   payment.stripeId,
        //     orderId:    payment.orderId,
        //     version:    payment.version
        // });
        // ------------------------------------------------------- End ------------------------------------------------------- //

        // Check the Razorpay payment status and update as captured if not already
        const razorpayPaymentObject = await razorpay.payments.fetch(razorpayPaymentId);
        if (razorpayPaymentObject.status !== 'captured') {
            // Update the payment status as captured
            const captureRazorpayPayment = razorpay.payments.capture(razorpayPaymentId, order.ticket.price, 'INR');
            if (!captureRazorpayPayment) {
                throw new BadRequestError('Issues while updating the Razorpay payment status as captured');
            }
            console.log(`RazorPay Payment with id ${razorpayPaymentId} for RazorPay Order id ${razorpayOrderId} has been succesfully captured`);
        }

        // Build the Payment record
        const payment = Payment.build({
            rzpPaymentId: razorpayPaymentId,
            orderId
        });
        await payment.save();

        // Set the Order status to Complete
        order.set({ status: OrderStatus.Completed });
        await order.save();

        // Publish an event for Payment Creation
        await new PaymentCreatedPublisher(connection!,exchange).publish({
            id:             payment.id,
            rzpPaymentId:   payment.rzpPaymentId,
            orderId:        payment.orderId,
            version:        payment.version
        });

        // Send Email to Order Owner
        sendEmail(order.userEmail, `Payment for Order ${payment.orderId} Completed Successfully!`, `Successfully purchased Ticket with Title - ${order.ticket.title} & Price - ${order.ticket.price}`);

        // Send Email to Ticket Owner
        sendEmail(order.ticket.userEmail, `Sold Ticket ${order.ticket.title} Successfully!`, `User ${order.userId} successfully purchased Ticket with Title - ${order.ticket.title} & Price - ${order.ticket.price}`);

        res.status(201).send({ payment });
    }   
);

export { router as createPaymentRouter };