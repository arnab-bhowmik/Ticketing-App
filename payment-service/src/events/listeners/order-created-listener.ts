import amqp from 'amqplib';
import { Subjects, Listener, OrderCreatedEvent } from "@ticketing_org/custom-modules";
import { Order } from '../../models/order';
// import { PaymentCreatedPublisher } from '../publishers/payment-created-publisher';
// import { connection, exchange } from '../../index';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;

    async processMessage(data: OrderCreatedEvent['data'], msg: amqp.ConsumeMessage) {
        // Check the 'type' property of the incoming event message and validate if it matches the Event Subject for this listener class 
        const eventType = msg.properties.type.toString();
        if (eventType === Subjects.OrderCreated) {
            // Create the Order 
            const order = Order.build({
                id: data.id,
                userId: data.userId,
                status: data.status,
                rzpOrderId: data.rzpOrderId,
                price: data.ticket.price,
                version: data.version
            });
            await order.save();
            
            // // Publish an event for Payment Create
            // await new PaymentCreatedPublisher(connection!,exchange).publish({
            //     id:      ticket.id,
            //     version: ticket.version,
            //     title:   ticket.title,
            //     price:   ticket.price,
            //     userId:  ticket.userId,
            //     orderId: ticket.orderId
            // });
            return Boolean(true);
        } else {
            return Boolean(false);
        }
    }
}