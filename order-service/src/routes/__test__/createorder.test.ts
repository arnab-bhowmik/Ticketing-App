import mongoose from 'mongoose';
import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order, OrderStatus } from "../../models/order";
import { connection } from '../../index';

// The following Order exists in the Razorpay Test Environment
const razorpayOrderId   = 'order_NeRdKk8eUnkUjd';

// ------------ Test Scenarios for identifying if current user is logged in and can reserve tickets via orders ------------

it('returns an error if the ticket does not exist', async () => {
    const ticketId = new mongoose.Types.ObjectId();
    await request(app).post('/api/orders').set('Cookie', global.signin()).send({ ticketId }).expect(404);
});

it('returns an error if the ticket is already reserved', async () => {
    // Generate a random User Id for Ticket Owner
    const ticketOwnerId = new mongoose.Types.ObjectId().toHexString();
    // Generate a random User Id for Order Owner
    const orderOwnerId = new mongoose.Types.ObjectId().toHexString();

    // Create a Ticket which is yet to be associated with an Order
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 200,
        userId: ticketOwnerId,
        userEmail: 'user1@abc.com'
    });
    await ticket.save();

    // Create a new Order and associate the ticket with this Order
    const order = Order.build({
        userId: orderOwnerId,
        userEmail: 'user2@abc.com',
        status: OrderStatus.Created,
        expiresAt: new Date(),
        rzpOrderId: razorpayOrderId, 
        ticket
    });
    await order.save();

    // Now try to associate the ticket with a new Order
    await request(app).post('/api/orders').set('Cookie', global.signin()).send({ ticketId: ticket.id }).expect(400);
});

it('reserves a ticket successfully', async () => {
    // Generate a random User Id for Ticket Owner
    const ticketOwnerId = new mongoose.Types.ObjectId().toHexString();

    // Create a Ticket which is yet to be associated with an Order
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 200,
        userId: ticketOwnerId,
        userEmail: 'user1@abc.com'
    });
    await ticket.save();

    // Now try to associate the ticket with a new Order
    await request(app).post('/api/orders').set('Cookie', global.signin()).send({ ticketId: ticket.id }).expect(201);
});

it('emits order created event on successful order creation', async () => {
    // Generate a random User Id for Ticket Owner
    const ticketOwnerId = new mongoose.Types.ObjectId().toHexString();

    // Create a Ticket which is yet to be associated with an Order
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 200,
        userId: ticketOwnerId,
        userEmail: 'user1@abc.com'
    });
    await ticket.save();

    // Now try to associate the ticket with a new Order
    await request(app).post('/api/orders').set('Cookie', global.signin()).send({ ticketId: ticket.id }).expect(201);

    // Emit event
    const channel = await connection.createChannel();
    expect(channel.publish).toHaveBeenCalled();
});