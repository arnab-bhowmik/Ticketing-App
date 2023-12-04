import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest } from '@ticketing_org/custom-modules';
import mongoose from 'mongoose';

const router = express.Router();

router.post('/api/orders', async (req: Request, res: Response) => {
    res.status(200).send({});
});

router.post('/api/orders', requireAuth, [
    body('ticketId')
     .notEmpty()
     .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
     .withMessage('Ticket Id is mandatory')
    ], 
    // Check for any Validation errors
    validateRequest,
    async (req: Request, res: Response) => {
        // const { title, price } = req.body;
        // const ticket = Ticket.build({
        //     title,
        //     price,
        //     userId: req.currentUser!.id
        // });
        // await ticket.save();
        res.status(201).send(ticket);
    }
);

export { router as createOrderRouter };