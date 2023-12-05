import mongoose from 'mongoose';
import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order, OrderStatus } from "../../models/order";

// ------------ Test Scenarios for identifying if current user is logged in and can reserve tickets via orders ------------

it('returns an error if the ticket does not exist', async () => {
    const ticketId = new mongoose.Types.ObjectId();
    await request(app).post('/api/orders').set('Cookie', global.signin()).send({ ticketId }).expect(404);
});

it('returns an error if the ticket is already reserved', async () => {
    // Create a Ticket which is yet to be associated with an Order
    const ticket = Ticket.build({
        title: 'concert',
        price: 200
    });
    await ticket.save();

    // Create a new Order and associate the ticket with this Order
    const order = Order.build({
        userId: 'user1@abc.com',
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket
    });
    await order.save();

    // Now try to associate the ticket with a new Order
    await request(app).post('/api/orders').set('Cookie', global.signin()).send({ ticketId: ticket.id }).expect(400);
});

it('reserves a ticket successfully', async () => {
    // Create a Ticket which is yet to be associated with an Order
    const ticket = Ticket.build({
        title: 'concert',
        price: 200
    });
    await ticket.save();

    // Now try to associate the ticket with a new Order
    await request(app).post('/api/orders').set('Cookie', global.signin()).send({ ticketId: ticket.id }).expect(201);

});