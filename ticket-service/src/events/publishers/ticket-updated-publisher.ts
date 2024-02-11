import { Subjects, Publisher, TicketUpdatedEvent } from "@ticketing_org/custom-modules";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}