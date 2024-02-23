import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { OrderStatus } from '@ticketing_org/custom-modules';
import { razorpay } from '../../services/razorpay';
import { Payment } from '../../models/payment';
import { connection } from '../../index';

// The following Order & Payment combination exists in the Razorpay Test Environment. Razorpay payment can only be created from UI hence using this combination here!
const razorpayOrderId   = 'order_NeRdKk8eUnkUjd';       
const razorpayPaymentId = 'pay_NeRdtXx4GUDlWc';  

it('returns 404 when making payment for an order that does not exist', async () => {
    await request(app).post('/api/payments').set('Cookie', global.signin()).send({ razorpayOrderId, razorpayPaymentId, orderId: new mongoose.Types.ObjectId().toHexString() }).expect(404);   
});

it('returns 401 when making payment for an order that does not belong to the User', async () => {
    // Build a new Order
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        rzpOrderId: razorpayOrderId,                     
        price: 950,
        version: 0
    });
    await order.save();

    await request(app).post('/api/payments').set('Cookie', global.signin()).send({ razorpayOrderId, razorpayPaymentId, orderId: order.id }).expect(401);
});

it('returns 400 when making payment for an cancelled order', async () => {
    // Generate a random User Id
    const userId = new mongoose.Types.ObjectId().toHexString();
    // Build a new Order
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId,
        status: OrderStatus.Cancelled,
        rzpOrderId: razorpayOrderId,
        price: 950,
        version: 0
    });
    await order.save();

    await request(app).post('/api/payments').set('Cookie', global.signin(userId)).send({ razorpayOrderId, razorpayPaymentId, orderId: order.id }).expect(400);
});

it('returns a 201 with valid inputs', async () => {
    // Generate a random User Id
    const userId = new mongoose.Types.ObjectId().toHexString();
    // Build a new Order
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId,
        status: OrderStatus.Created,
        rzpOrderId: razorpayOrderId,
        price: 950,
        version: 0
    });
    await order.save();
  
    await request(app).post('/api/payments').set('Cookie', global.signin(userId)).send({ razorpayOrderId, razorpayPaymentId, orderId: order.id }).expect(201);
  
    const razorpayPaymentObject = await razorpay.payments.fetch(razorpayPaymentId);
  
    expect(razorpayPaymentObject).not.toBeNull();
    expect(razorpayPaymentObject!.order_id).toEqual(razorpayOrderId);
    expect(razorpayPaymentObject!.status).toEqual('captured');
    expect(razorpayPaymentObject!.amount).toEqual(order.price * 100);
    expect(razorpayPaymentObject!.currency).toEqual('INR');
});

it('emits payment created event on successful payment creation', async () => {
    // Generate a random User Id
    const userId = new mongoose.Types.ObjectId().toHexString();
    // Build a new Order
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId,
        status: OrderStatus.Created,
        rzpOrderId: razorpayOrderId,
        price: 950,
        version: 0
    });
    await order.save();
  
    await request(app).post('/api/payments').set('Cookie', global.signin(userId)).send({ razorpayOrderId, razorpayPaymentId, orderId: order.id }).expect(201);
  
    // Emit event
    const channel = await connection.createChannel();
    expect(channel.publish).toHaveBeenCalled();
});