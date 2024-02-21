import mongoose from 'mongoose';
import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order, OrderStatus } from "../../models/order";

// ------------ Test Scenarios for updating status for a specific Order to Cancelled ------------

it('returns an error if a different user tries to fetch another user order for marking it deleted', async () => {
    // Create a Concert Ticket 
    const ticket = Ticket.build({ id: new mongoose.Types.ObjectId().toHexString(), title: 'concert', price: 200 });
    await ticket.save();

    // Create Two Users
    const user1 = global.signin();
    const user2 = global.signin();

    // Create a new Order as user1 and associate ticket with this Order
    const { body: order } = await request(app).post('/api/orders').set('Cookie', user1).send({ ticketId: ticket.id }).expect(201);

    // Send a request to mark the Order as cancelled as user2
    await request(app).delete(`/api/orders/${order.id}`).set('Cookie', user2).expect(401);
});

it('marks a particular Order as Cancelled', async () => {
    // Create a Concert Ticket 
    const ticket = Ticket.build({ id: new mongoose.Types.ObjectId().toHexString(), title: 'concert', price: 200 });
    await ticket.save();

    // Create a User
    const user = global.signin();

    // Create a new Order as user and associate ticket with this Order
    const { body: order } = await request(app).post('/api/orders').set('Cookie', user).send({ ticketId: ticket.id }).expect(201);

    // Send a request to mark the Order as cancelled as the same user
    await request(app).delete(`/api/orders/${order.id}`).set('Cookie', user).expect(204);

    // Send a request to fetch details of the Order as the same user and confirm the status has been updated
    const { body: updatedOrder } = await request(app).get(`/api/orders/${order.id}`).set('Cookie', user);
    expect(updatedOrder.status).toEqual(OrderStatus.Cancelled);
});