import amqp from 'amqplib';
import { Subjects, Listener, OrderCancelledEvent } from "@ticketing_org/custom-modules";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;

    async processMessage(data: OrderCancelledEvent['data'], msg: amqp.ConsumeMessage) {
        // Check the 'type' property of the incoming event message and validate if it matches the Event Subject for this listener class 
        const eventType = msg.properties.type.toString();
        if (eventType === Subjects.OrderCancelled) {
            // To-Do :- Set the incoming event attribute values to unreserve a ticket record
            return Boolean(true);
        } else {
            return Boolean(false);
        }
    }
}