import amqp from 'amqplib';
import { Subjects, Listener, OrderCreatedEvent } from "@ticketing_org/custom-modules";
import { expirationQueue } from '../../queues/expiration-queue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;

    async processMessage(data: OrderCreatedEvent['data'], msg: amqp.ConsumeMessage) {
        // Check the 'type' property of the incoming event message and validate if it matches the Event Subject for this listener class 
        const eventType = msg.properties.type.toString();
        if (eventType === Subjects.OrderCreated) {
            // Invoke the Order Expiration job once predefined timeout counter expires
            const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
            console.log(`Waiting for ${delay} ms to process the expiration job!`);

            await expirationQueue.add({
                orderId: data.id
            },{
                delay
            });
            return Boolean(true);
        } else {
            return Boolean(false);
        }
    }
}