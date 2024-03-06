import express, { Request, Response } from 'express';
import { requireAuth, validateRequest, NotFoundError, BadRequestError, NotAuthorizedError } from '@ticketing_org/custom-modules';
import { Ticket } from '../models/ticket';
import { TicketDeletedPublisher } from '../events/publishers/ticket-deleted-publisher';
import { connection, exchange } from '../index';
import { sendEmail } from '../services/transporter';

const router = express.Router();             

router.delete('/api/tickets/:ticketId', requireAuth, async (req: Request, res: Response) => {
    // Retrieve the Ticket details for the provided Ticket Id
    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) {
        throw new NotFoundError('Ticket Not Found');
    }
    if (ticket.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }
    // Check if the Ticket isn't already associated with an Order. This scenario happens when both the Ticket Creator & Buyer have navigated to the Ticket Details page from the Landing Page
    if (ticket.orderId !== undefined) {
        throw new BadRequestError(`Cannot delete Ticket - ${ticket.title} as it is associated with Order ${ticket.orderId}`);
    }
    // Delete the Ticket record from the database
    try {
        await Ticket.findByIdAndDelete(req.params.ticketId);      
    } catch (error) {
        console.log(error);
        throw new BadRequestError(`Encountered error while deleting Ticket - ${ticket.title}`);
    }

    // Publish an event for Ticket Deletion
    await new TicketDeletedPublisher(connection!,exchange).publish({
        id:      ticket.id,
        version: ticket.version,
        title:   ticket.title,
        price:   ticket.price,
        userId:  ticket.userId
    });

    // Send Email to User
    sendEmail(req.currentUser!.email, `Ticket ${ticket.id} Deleted Successfully!`, `Deleted Ticket listed on TicketMart with Title - ${ticket.title} & Price - ${ticket.price}`);

    res.status(204).send(ticket);  
});

export { router as deleteTicketRouter };