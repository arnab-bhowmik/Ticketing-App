import amqp from 'amqplib';
import { Subjects, Listener, TicketCreatedEvent } from "@ticketing_org/custom-modules";
import { Ticket } from "../../models/ticket";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    subject: Subjects.TicketCreated = Subjects.TicketCreated;

    async processMessage(data: TicketCreatedEvent['data'], msg: amqp.ConsumeMessage) {
        // Check the 'type' property of the incoming event message and validate if it matches the Event Subject for this listener class
        const eventType = msg.properties.type.toString();
        if (eventType === Subjects.TicketCreated) {
            // Set the incoming event attribute values to create a new ticket record
            const { id, title, price } = data;
            const ticket = Ticket.build({
                id,
                title,
                price
            });
            await ticket.save();
            return Boolean(true);  
        } else {
            return Boolean(false);
        }    
    }
}