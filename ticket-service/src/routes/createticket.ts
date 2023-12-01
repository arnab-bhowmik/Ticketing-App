import express, { Request, Response } from 'express';
import { requireAuth, validateRequest, BadRequestError } from '@ticketing_org/custom-modules';

const router = express.Router();

router.post('/api/tickets', requireAuth, (req: Request, res: Response) => {
    res.sendStatus(200);
});

export { router as createTicketRouter };