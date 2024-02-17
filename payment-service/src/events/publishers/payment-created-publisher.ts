import { Subjects, Publisher, PaymentCreatedEvent } from "@ticketing_org/custom-modules";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
    routingKey: Subjects.PaymentCreated = Subjects.PaymentCreated;
}