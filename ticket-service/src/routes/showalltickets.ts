import express, { Request, Response } from 'express';
import { NotFoundError } from '@ticketing_org/custom-modules';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.get('/api/tickets', async (req: Request, res: Response) => {
    // Fetch the list of Tickets with no associated Orders i.e. available for purchase
    const tickets = await Ticket.find({ orderId: undefined });
    res.status(200).send(tickets);
});

export { router as showAllTicketsRouter };