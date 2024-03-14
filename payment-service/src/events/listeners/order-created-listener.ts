import amqp from 'amqplib';
import { Subjects, Listener, OrderCreatedEvent, NotFoundError, BadRequestError } from "@ticketing_org/custom-modules";
import { Order } from '../../models/order';
import { Ticket } from '../../models/ticket';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;

    async processMessage(data: OrderCreatedEvent['data'], msg: amqp.ConsumeMessage) {
        // Check the 'type' property of the incoming event message and validate if it matches the Event Subject for this listener class 
        const eventType = msg.properties.type.toString();
        if (eventType === Subjects.OrderCreated) {
            // Ideally the Ticket attributes can also be fetched from the incoming OrderCreatedEvent, however the Ticket Doc format
            // which needs to be used for creating the Order can only be achieved on fetching the Ticket record from corresponding Collection.
            // Find the ticket the order is trying to reserve
            const ticket = await Ticket.findById(data.ticket.id);
            if (!ticket) {
                throw new NotFoundError('Ticket Not Found');
            }
            // Check if the Ticket's version is the same as the incoming event
            if (ticket.version != data.ticket.version) {
                throw new BadRequestError(`Ticket record version ${ticket.version} does not match with incoming Order Created Event's reserved ticket version ${data.ticket.version}`);
            }
            // Skipping any validation checks as those are already handled within the Order Service prior creating the Order!
            // Create the Order 
            const order = Order.build({
                id:         data.id,
                userId:     data.userId,
                userEmail:  data.userEmail,
                status:     data.status,
                rzpOrderId: data.rzpOrderId,
                ticket:     ticket,
                version:    data.version
            });
            await order.save();
            
            return Boolean(true);
        } else {
            return Boolean(false);
        }
    }
}