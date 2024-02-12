import { Subjects, Listener, OrderCancelledEvent } from "@ticketing_org/custom-modules";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}