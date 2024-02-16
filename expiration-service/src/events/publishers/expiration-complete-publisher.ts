import { Subjects, Publisher, ExpirationCompleteEvent } from "@ticketing_org/custom-modules";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
    routingKey: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}