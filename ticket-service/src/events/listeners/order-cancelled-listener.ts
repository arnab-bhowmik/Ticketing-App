import amqp from 'amqplib';
import { Subjects, Listener, OrderCancelledEvent, NotFoundError, BadRequestError } from "@ticketing_org/custom-modules";
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
                throw new NotFoundError('Ticket Not Found');
            }
            // Check if the Order Cancellation Event is for the same OrderId the Ticket is currently associated with
            if (ticket.orderId != data.id) {
                throw new BadRequestError('Order Cancellation Event does not correspond to the Order the Ticket is currently associated with');
            }
            // Mark the ticket as being unreserved by setting its orderId property to undefined
            ticket.set({ orderId: undefined });
            await ticket.save();
            // Publish an event for Ticket Update
            await new TicketUpdatedPublisher(connection!,exchange).publish({
                id:         ticket.id,
                version:    ticket.version,
                title:      ticket.title,
                price:      ticket.price,
                userId:     ticket.userId,
                userEmail:  ticket.userEmail,
                orderId:    ticket.orderId
            });
            return Boolean(true);
        } else {
            return Boolean(false);
        }
    }
}