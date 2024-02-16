import { Subjects, Publisher, TicketCreatedEvent } from "@ticketing_org/custom-modules";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    subject: Subjects.TicketCreated = Subjects.TicketCreated;
    routingKey: Subjects.TicketCreated = Subjects.TicketCreated;
}