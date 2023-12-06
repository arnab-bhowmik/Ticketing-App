import { OrderCancelledEvent  } from "@ticketing_org/custom-modules";
import { Subjects } from "@ticketing_org/custom-modules/build/events/subjects";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}