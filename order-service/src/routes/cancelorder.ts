import express, { Request, Response } from 'express';
import { requireAuth, validateRequest, NotFoundError, BadRequestError, NotAuthorizedError } from '@ticketing_org/custom-modules';
import { Order, OrderStatus } from '../models/order';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { connection, exchange } from '../index';
import { sendEmail } from '../services/transporter';

const router = express.Router();

router.delete('/api/orders/:orderId', requireAuth, async (req: Request, res: Response) => {
    // Retrieve the Order details for the provided Order Id
    const order = await Order.findById(req.params.orderId).populate('ticket');
    if (!order) {
        throw new NotFoundError('Order Not Found');
    } 
    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }
    // Update the Order Status to Cancelled
    order.status = OrderStatus.Cancelled;
    await order.save();

    // Publish an event for Order Cancellation
    await new OrderCancelledPublisher(connection!,exchange).publish({
        id:         order.id,
        version:    order.version,
        userId:     order.userId,
        userEmail:  order.userEmail,
        status:     order.status,
        expiresAt:  order.expiresAt.toISOString(),
        rzpOrderId: order.rzpOrderId,
        ticket: {
            id:         order.ticket.id,
            title:      order.ticket.title,
            price:      order.ticket.price,
            userId:     order.ticket.userId,
            userEmail:  order.ticket.userEmail,
            version:    order.ticket.version
        }
    });

    // Send Email to User
    sendEmail(order.userEmail, `Order ${order.id} Cancelled Successfully!`, `Order cancelled against purchase of Ticket with Title - ${order.ticket.title} & Price - ${order.ticket.price}`);

    res.status(204).send(order);
});

export { router as cancelOrderRouter };