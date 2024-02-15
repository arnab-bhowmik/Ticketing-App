import amqp from 'amqplib';
import { Subjects, Listener, OrderCreatedEvent } from "@ticketing_org/custom-modules";
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';
import { connection, exchange } from '../../index';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;

    async processMessage(data: OrderCreatedEvent['data'], msg: amqp.ConsumeMessage) {
        // Check the 'type' property of the incoming event message and validate if it matches the Event Subject for this listener class 
        const eventType = msg.properties.type.toString();
        if (eventType === Subjects.OrderCreated) {
            // Find the ticket that the Order is reserving
            const ticket = await Ticket.findById(data.ticket.id);
            if (!ticket) {
                throw new Error('Ticket not found');
            }
            // Mark the ticket as being reserved by setting its orderId property
            ticket.set({ orderId: data.id });
            await ticket.save();
            // Publish an event for Ticket Update
            await new TicketUpdatedPublisher(connection!,exchange).publish({
                id:      ticket.id,
                version: ticket.version,
                title:   ticket.title,
                price:   ticket.price,
                userId:  ticket.userId,
                orderId: ticket.orderId
            });
            return Boolean(true);
        } else {
            return Boolean(false);
        }
    }
}