import express, { Request, Response } from 'express';
import { NotFoundError } from '@ticketing_org/custom-modules';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.get('/api/tickets', async (req: Request, res: Response) => {
        const tickets = await Ticket.find({});
        // Throw error if the Ticket doesn't exist otherwise return the Ticket
        if (!tickets) {
            throw new NotFoundError();
        }
        res.status(200).send(tickets);
    }
);

export { router as showAllTicketsRouter };