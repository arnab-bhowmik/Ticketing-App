import amqp from 'amqplib';
import { Subjects, Listener, OrderCreatedEvent } from "@ticketing_org/custom-modules";
import { Ticket } from '../../models/ticket';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;

    async processMessage(data: OrderCreatedEvent['data'], msg: amqp.ConsumeMessage) {
        // Check the 'type' property of the incoming event message and validate if it matches the Event Subject for this listener class 
        const eventType = msg.properties.type.toString();
        if (eventType === Subjects.OrderCreated) {
            // To-Do :- Send out Order Expiration event once predefined timeout counter expires
            return Boolean(true);
        } else {
            return Boolean(false);
        }
    }
}