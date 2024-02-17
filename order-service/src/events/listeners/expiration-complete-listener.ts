import amqp from 'amqplib';
import { Subjects, Listener, ExpirationCompleteEvent, OrderStatus } from "@ticketing_org/custom-modules";
import { Order } from '../../models/order';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';
import { connection, exchange } from '../../index';

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;

    async processMessage(data: ExpirationCompleteEvent['data'], msg: amqp.ConsumeMessage) {
        // Check the 'type' property of the incoming event message and validate if it matches the Event Subject for this listener class
        const eventType = msg.properties.type.toString();
        if (eventType === Subjects.ExpirationComplete) {
            // Find the Order that needs to be expired
            const order = await Order.findById(data.orderId).populate('ticket');
            if (!order) {
                throw new Error('Order not found');
            }
            // Update the Order Status to Cancelled
            order.set({ status: OrderStatus.Cancelled });
            await order.save();

            // Publish an event for Order Cancellation
            await new OrderCancelledPublisher(connection!,exchange).publish({
                id:         order.id,
                version:    order.version,
                userId:     order.userId,
                status:     order.status,
                expiresAt:  order.expiresAt.toISOString(),
                ticket: {
                    id:     order.ticket.id,
                    price:  order.ticket.price
                }
            });

            return Boolean(true);  
        } else {
            return Boolean(false);
        }    
    }
}