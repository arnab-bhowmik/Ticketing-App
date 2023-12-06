import express, { Request, Response } from 'express';
import { requireAuth, validateRequest, NotFoundError, BadRequestError, NotAuthorizedError } from '@ticketing_org/custom-modules';
import { Order, OrderStatus } from '../models/order';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';

const router = express.Router();

router.delete('/api/orders/:orderId', requireAuth, async (req: Request, res: Response) => {
    // Retrieve the Order details for the provided Order Id
    const order = await Order.findById(req.params.orderId).populate('ticket');
    if (!order) {
        throw new NotFoundError();
    } 
    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }
    // Update the Order Status to Cancelled
    order.status = OrderStatus.Cancelled;
    await order.save();

    // Publish an event for Order Cancellation
    new OrderCancelledPublisher().publish({
        id:         order.id,
        userId:     order.userId,
        status:     order.status,
        expiresAt:  order.expiresAt.toISOString(),
        ticket: {
            id:     order.ticket.id,
            price:  order.ticket.price
        }
    });

    res.status(204).send(order);
});

export { router as deleteOrderRouter };