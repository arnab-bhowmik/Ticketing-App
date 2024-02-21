import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { OrderStatus } from '@ticketing_org/custom-modules';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';
import { connection } from '../../index';

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

// it('returns a 201 with valid inputs', async () => {
//     // Generate a random User Id
//     const userId = new mongoose.Types.ObjectId().toHexString();
//     // Build a new Order
//     const order = Order.build({
//         id: new mongoose.Types.ObjectId().toHexString(),
//         userId,
//         status: OrderStatus.Created,
//         price: 200,
//         version: 0
//     });
//     await order.save();
  
//     await request(app).post('/api/payments').set('Cookie', global.signin(userId)).send({ token: 'tok_visa', orderId: order.id }).expect(201);
  
//     const stripeCharges = await stripe.charges.list({ limit: 50 });
//     const stripeCharge = stripeCharges.data.find((charge) => {
//       return charge.amount === 200 * 100;
//     });
  
//     expect(stripeCharge).toBeDefined();
//     expect(stripeCharge!.currency).toEqual('usd');
  
//     const payment = await Payment.findOne({ orderId: order.id, stripeId: stripeCharge!.id });
//     expect(payment).not.toBeNull();
// });

// it('emits payment created event on successful payment creation', async () => {
//     // Generate a random User Id
//     const userId = new mongoose.Types.ObjectId().toHexString();
//     // Build a new Order
//     const order = Order.build({
//         id: new mongoose.Types.ObjectId().toHexString(),
//         userId,
//         status: OrderStatus.Created,
//         price: 400,
//         version: 0
//     });
//     await order.save();
  
//     await request(app).post('/api/payments').set('Cookie', global.signin(userId)).send({ token: 'tok_visa', orderId: order.id }).expect(201);
  
//     // Emit event
//     const channel = await connection.createChannel();
//     expect(channel.publish).toHaveBeenCalled();
// });