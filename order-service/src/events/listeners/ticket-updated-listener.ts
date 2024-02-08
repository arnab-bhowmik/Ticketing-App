import { Subjects, Listener, TicketUpdatedEvent } from "@ticketing_org/custom-modules";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}