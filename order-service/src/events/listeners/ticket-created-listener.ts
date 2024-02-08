import { Subjects, Listener, TicketCreatedEvent } from "@ticketing_org/custom-modules";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    subject: Subjects.TicketCreated = Subjects.TicketCreated;
}