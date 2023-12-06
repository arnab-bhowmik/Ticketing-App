import mongoose from 'mongoose';
import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order, OrderStatus } from "../../models/order";

// ------------ Test Scenarios for identifying if current user is logged in and display all associated tickets ------------

it('fetches all orders for a particular User', async () => {
    // Create a Concert Ticket 
    const ticket1 = Ticket.build({ title: 'concert', price: 200 });
    await ticket1.save();
    // Create a Movie Ticket 
    const ticket2 = Ticket.build({ title: 'movie', price: 300 });
    await ticket2.save();
    // Create a Game Ticket 
    const ticket3 = Ticket.build({ title: 'game', price: 400 });
    await ticket3.save();
    // ----------------------------------------------------------------------- //
    // Create Two Users
    const user1 = global.signin();
    const user2 = global.signin();
    // ----------------------------------------------------------------------- //
    // Create a new Order as user1 and associate ticket1 with this Order
    await request(app).post('/api/orders').set('Cookie', user1).send({ ticketId: ticket1.id }).expect(201);
    // Create a new Order as user2 and associate ticket2 with this Order
    await request(app).post('/api/orders').set('Cookie', user2).send({ ticketId: ticket2.id }).expect(201);
    // Create a new Order as user2 and associate ticket3 with this Order
    await request(app).post('/api/orders').set('Cookie', user2).send({ ticketId: ticket3.id }).expect(201);
    // ----------------------------------------------------------------------- //

    const response = await request(app).get('/api/orders').set('Cookie', user2).expect(200);
    expect(response.body.length).toEqual(2);
});