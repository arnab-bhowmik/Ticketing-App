import { Subjects, Publisher, OrderCreatedEvent } from "@ticketing_org/custom-modules";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    routingKey: Subjects.OrderCreated = Subjects.OrderCreated;
}