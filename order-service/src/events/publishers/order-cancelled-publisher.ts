import { Subjects, Publisher, OrderCancelledEvent } from "@ticketing_org/custom-modules";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    routingKey: Subjects.OrderCancelled = Subjects.OrderCancelled;
}