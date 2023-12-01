import express, { Request, Response } from 'express';
import { NotFoundError } from '@ticketing_org/custom-modules';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
        const ticket = await Ticket.findById(req.params.id);
        // Throw error if the Ticket doesn't exist otherwise return the Ticket
        if (!ticket) {
            throw new NotFoundError();
        }
        res.status(200).send(ticket);
    }
);

export { router as showTicketRouter };