import { OrderCreatedEvent  } from "@ticketing_org/custom-modules";
import { Subjects } from "@ticketing_org/custom-modules/build/events/subjects";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
}