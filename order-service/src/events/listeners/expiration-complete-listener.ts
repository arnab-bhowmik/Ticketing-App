import amqp from 'amqplib';
import { Subjects, Listener, ExpirationCompleteEvent, OrderStatus, NotFoundError } from "@ticketing_org/custom-modules";
import { Order } from '../../models/order';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';
import { connection, exchange } from '../../index';
import { sendEmail } from '../../services/transporter';

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;

    async processMessage(data: ExpirationCompleteEvent['data'], msg: amqp.ConsumeMessage) {
        // Check the 'type' property of the incoming event message and validate if it matches the Event Subject for this listener class
        const eventType = msg.properties.type.toString();
        if (eventType === Subjects.ExpirationComplete) {
            // Find the Order that needs to be expired
            const order = await Order.findById(data.orderId).populate('ticket');
            if (!order) {
                throw new NotFoundError('Order Not Found');
            }
            
            // Check if the Order is already marked as complete prior its expiry. If YES, don't update the status from 'Complete' to 'Cancelled'
            if (order.status === OrderStatus.Completed) {
                console.log('Order is already Complete, hence not updating status to Cancelled');
            } else {
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
                    rzpOrderId: order.rzpOrderId,
                    ticket: {
                        id:     order.ticket.id,
                        title:  order.ticket.title,
                        price:  order.ticket.price
                    }
                });

                // Send Email to User
                // sendEmail(req.currentUser!.email, `Order ${order.id} Cancelled Successfully!`, `Order cancelled due to timeout against purchase of Ticket with Title - ${order.ticket.title} & Price - ${order.ticket.price}`);
            }

            return Boolean(true);  
        } else {
            return Boolean(false);
        }    
    }
}