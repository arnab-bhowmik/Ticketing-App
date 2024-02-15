import amqp from 'amqplib';
import { Subjects, Listener, OrderCancelledEvent } from "@ticketing_org/custom-modules";
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';
import { connection, exchange } from '../../index';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;

    async processMessage(data: OrderCancelledEvent['data'], msg: amqp.ConsumeMessage) {
        // Check the 'type' property of the incoming event message and validate if it matches the Event Subject for this listener class 
        const eventType = msg.properties.type.toString();
        if (eventType === Subjects.OrderCancelled) {
            // Find the ticket that the Order is reserving
            const ticket = await Ticket.findById(data.ticket.id);
            if (!ticket) {
                throw new Error('Ticket not found');
            }
            // Mark the ticket as being unreserved by setting its orderId property to undefined
            ticket.set({ orderId: undefined });
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