import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { razorpay } from '../../services/razorpay';
import { connection } from '../../index';

// The following Order & Payment combination exists in the Razorpay Test Environment. Razorpay payment can only be created from UI hence using this combination here!
const razorpayOrderId   = 'order_NeRdKk8eUnkUjd';       
const razorpayPaymentId = 'pay_NeRdtXx4GUDlWc';  

it('returns 404 when making payment for an order that does not exist', async () => {
    await request(app).post('/api/payments').set('Cookie', global.signin()).send({ razorpayOrderId, razorpayPaymentId, orderId: new mongoose.Types.ObjectId().toHexString() }).expect(404);   
});

it('returns 401 when making payment for an order that does not belong to the User', async () => {
    // Generate a random User Id for Ticket Owner
    const ticketOwnerId = new mongoose.Types.ObjectId().toHexString();
    // Generate a random User Id for Order Owner
    const orderOwnerId = new mongoose.Types.ObjectId().toHexString();

    // Create a Ticket which is yet to be associated with an Order
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 950,
        userId: ticketOwnerId,
        userEmail: 'user1@abc.com'
    });
    await ticket.save();

    // Create a new Order and associate the ticket with this Order
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: orderOwnerId,
        userEmail: 'user2@abc.com',
        status: OrderStatus.Created,
        rzpOrderId: razorpayOrderId, 
        ticket,
        version: 0
    });
    await order.save();

    await request(app).post('/api/payments').set('Cookie', global.signin()).send({ razorpayOrderId, razorpayPaymentId, orderId: order.id }).expect(401);
});

it('returns 400 when making payment for an cancelled order', async () => {
    // Generate a random User Id for Ticket Owner
    const ticketOwnerId = new mongoose.Types.ObjectId().toHexString();
    // Generate a random User Id for Order Owner
    const orderOwnerId = new mongoose.Types.ObjectId().toHexString();

    // Create a Ticket which is yet to be associated with an Order
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 950,
        userId: ticketOwnerId,
        userEmail: 'user1@abc.com'
    });
    await ticket.save();

    // Create a new Order and associate the ticket with this Order
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: orderOwnerId,
        userEmail: 'user2@abc.com',
        status: OrderStatus.Cancelled,
        rzpOrderId: razorpayOrderId,
        ticket,
        version: 0
    });
    await order.save();

    await request(app).post('/api/payments').set('Cookie', global.signin(orderOwnerId)).send({ razorpayOrderId, razorpayPaymentId, orderId: order.id }).expect(400);
});

it('returns a 201 with valid inputs', async () => {
    // Generate a random User Id for Ticket Owner
    const ticketOwnerId = new mongoose.Types.ObjectId().toHexString();
    // Generate a random User Id for Order Owner
    const orderOwnerId = new mongoose.Types.ObjectId().toHexString();

    // Create a Ticket which is yet to be associated with an Order
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 950,
        userId: ticketOwnerId,
        userEmail: 'user1@abc.com'
    });
    await ticket.save();

    // Create a new Order and associate the ticket with this Order
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: orderOwnerId,
        userEmail: 'user2@abc.com',
        status: OrderStatus.Created,
        rzpOrderId: razorpayOrderId,
        ticket,
        version: 0
    });
    await order.save();
  
    await request(app).post('/api/payments').set('Cookie', global.signin(orderOwnerId)).send({ razorpayOrderId, razorpayPaymentId, orderId: order.id }).expect(201);
  
    const razorpayPaymentObject = await razorpay.payments.fetch(razorpayPaymentId);
  
    expect(razorpayPaymentObject).not.toBeNull();
    expect(razorpayPaymentObject!.order_id).toEqual(razorpayOrderId);
    expect(razorpayPaymentObject!.status).toEqual('captured');
    expect(razorpayPaymentObject!.amount).toEqual(order.ticket.price * 100);
    expect(razorpayPaymentObject!.currency).toEqual('INR');
});

it('emits payment created event on successful payment creation', async () => {
    // Generate a random User Id for Ticket Owner
    const ticketOwnerId = new mongoose.Types.ObjectId().toHexString();
    // Generate a random User Id for Order Owner
    const orderOwnerId = new mongoose.Types.ObjectId().toHexString();

    // Create a Ticket which is yet to be associated with an Order
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 950,
        userId: ticketOwnerId,
        userEmail: 'user1@abc.com'
    });
    await ticket.save();

    // Create a new Order and associate the ticket with this Order
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: orderOwnerId,
        userEmail: 'user2@abc.com',
        status: OrderStatus.Created,
        rzpOrderId: razorpayOrderId,
        ticket,
        version: 0
    });
    await order.save();
  
    await request(app).post('/api/payments').set('Cookie', global.signin(orderOwnerId)).send({ razorpayOrderId, razorpayPaymentId, orderId: order.id }).expect(201);
  
    // Emit event
    const channel = await connection.createChannel();
    expect(channel.publish).toHaveBeenCalled();
});