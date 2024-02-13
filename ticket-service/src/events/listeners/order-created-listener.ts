import amqp from 'amqplib';
import { Subjects, Listener, OrderCreatedEvent } from "@ticketing_org/custom-modules";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;

    async processMessage(data: OrderCreatedEvent['data'], msg: amqp.ConsumeMessage) {
        // Check the 'type' property of the incoming event message and validate if it matches the Event Subject for this listener class 
        const eventType = msg.properties.type.toString();
        if (eventType === Subjects.OrderCreated) {
            // To-Do :- Set the incoming event attribute values to reserve a ticket record 
            return Boolean(true);
        } else {
            return Boolean(false);
        }
    }
}