import { Subjects, Publisher, TicketDeletedEvent } from "@ticketing_org/custom-modules";

export class TicketDeletedPublisher extends Publisher<TicketDeletedEvent> {
    subject: Subjects.TicketDeleted = Subjects.TicketDeleted;
    routingKey: Subjects.TicketDeleted = Subjects.TicketDeleted;
}