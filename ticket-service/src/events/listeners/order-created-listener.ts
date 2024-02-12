import { Subjects, Listener, OrderCreatedEvent } from "@ticketing_org/custom-modules";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
}