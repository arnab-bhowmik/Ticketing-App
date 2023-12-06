import express, { Request, Response } from 'express';
import { requireAuth, validateRequest, NotFoundError, OrderStatus, BadRequestError } from '@ticketing_org/custom-modules';
import { Order } from '../models/order';

const router = express.Router();

router.get('/api/orders', requireAuth, async (req: Request, res: Response) => {
    // Retrieve Orders created using the User Id provided
    const orders = await Order.find({
        userId: req.currentUser!.id
    }).populate('ticket');
    res.status(200).send(orders);
});

export { router as showAllOrdersRouter };