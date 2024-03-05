import amqp from 'amqplib';
import { Subjects, Listener, OrderCancelledEvent, BadRequestError } from "@ticketing_org/custom-modules";
import { Order } from '../../models/order';
import { OrderStatus } from '@ticketing_org/custom-modules';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;

    async processMessage(data: OrderCancelledEvent['data'], msg: amqp.ConsumeMessage) {
        // Check the 'type' property of the incoming event message and validate if it matches the Event Subject for this listener class 
        const eventType = msg.properties.type.toString();
        if (eventType === Subjects.OrderCancelled) {
            // Find the order
            const order = await Order.findOne({
                _id: data.id,
                version: data.version - 1
            });
            if (!order) {
                throw new BadRequestError('Order not found');
            }
            // Update the Order status to Cancelled
            order.set({ status: OrderStatus.Cancelled });
            await order.save();
            
            return Boolean(true);
        } else {
            return Boolean(false);
        }
    }
}