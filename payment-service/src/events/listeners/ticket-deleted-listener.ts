import amqp from 'amqplib';
import { Subjects, Listener, TicketDeletedEvent } from "@ticketing_org/custom-modules";
import { Ticket } from '../../models/ticket';

export class TicketDeletedListener extends Listener<TicketDeletedEvent> {
    subject: Subjects.TicketDeleted = Subjects.TicketDeleted;

    async processMessage(data: TicketDeletedEvent['data'], msg: amqp.ConsumeMessage) {
        // Check the 'type' property of the incoming event message and validate if it matches the Event Subject for this listener class
        const eventType = msg.properties.type.toString();
        if (eventType === Subjects.TicketDeleted) {
            // Delete the Ticket record from the database
            await Ticket.findByIdAndDelete(data.id);

            return Boolean(true);  
        } else {
            return Boolean(false);
        }    
    }
}