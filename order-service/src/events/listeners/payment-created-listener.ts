import amqp from 'amqplib';
import { Subjects, Listener, PaymentCreatedEvent, OrderStatus, NotFoundError } from "@ticketing_org/custom-modules";
import { Order } from "../../models/order";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;

    async processMessage(data: PaymentCreatedEvent['data'], msg: amqp.ConsumeMessage) {
        // Check the 'type' property of the incoming event message and validate if it matches the Event Subject for this listener class
        const eventType = msg.properties.type.toString();
        if (eventType === Subjects.PaymentCreated) {
            // Lookup the Order to be marked as Completed
            const { orderId } = data;
            const order = await Order.findById(orderId);
            if (!order) {
                throw new NotFoundError('Order Not Found');
            }
            // Set the Order status to Complete
            order.set({ status: OrderStatus.Completed });
            await order.save();

            return Boolean(true);  
        } else {
            return Boolean(false);
        }    
    }
}