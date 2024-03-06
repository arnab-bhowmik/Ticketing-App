import amqp from 'amqplib';
import { Subjects, Listener, TicketUpdatedEvent, NotFoundError } from "@ticketing_org/custom-modules";
import { Ticket } from "../../models/ticket";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;

    async processMessage(data: TicketUpdatedEvent['data'], msg: amqp.ConsumeMessage) {
        // Check the 'type' property of the incoming event message and validate if it matches the Event Subject for this listener class 
        const eventType = msg.properties.type.toString();
        if (eventType === Subjects.TicketUpdated) {
            const ticket = await Ticket.findOne({
                _id: data.id,
                version: data.version - 1
            });
            if (!ticket) {
                throw new NotFoundError('Ticket Not Found');
            }
            // Set the incoming event attribute values to the ticket record
            const { title, price } = data;
            ticket.set({ title, price });
            await ticket.save();
            return Boolean(true);
        } else {
            return Boolean(false);
        }  
    }
}