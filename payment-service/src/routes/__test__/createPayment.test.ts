import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { OrderStatus } from '@ticketing_org/custom-modules';

it('returns 404 when making payment for an order that does not exist', async () => {
    await request(app).post('/api/payments').set('Cookie', global.signin()).send({ token: 'yfgh', orderId: new mongoose.Types.ObjectId().toHexString() }).expect(404);   
});

it('returns 401 when making payment for an order that does not belong to the User', async () => {
    // Build a new Order
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        price: 200,
        version: 0
    });
    await order.save();

    await request(app).post('/api/payments').set('Cookie', global.signin()).send({ token: 'yfgh', orderId: order.id }).expect(401);
});

it('returns 400 when making payment for an cancelled order', async () => {
    // Generate a random User Id
    const userId = new mongoose.Types.ObjectId().toHexString();
    // Build a new Order
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId,
        status: OrderStatus.Cancelled,
        price: 200,
        version: 0
    });
    await order.save();

    await request(app).post('/api/payments').set('Cookie', global.signin(userId)).send({ token: 'yfgh', orderId: order.id }).expect(400);
});

// it(returns 201 on valid payment createInputFiles, async () => {

// });