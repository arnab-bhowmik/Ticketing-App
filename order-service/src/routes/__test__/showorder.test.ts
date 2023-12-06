import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";

// ------------ Test Scenarios for displaying details for a specific Order ------------

it('returns an error if a different user tries to fetch another user order', async () => {
    // Create a Concert Ticket 
    const ticket = Ticket.build({ title: 'concert', price: 200 });
    await ticket.save();

    // Create Two Users
    const user1 = global.signin();
    const user2 = global.signin();

    // Create a new Order as user1 and associate ticket with this Order
    const { body: order } = await request(app).post('/api/orders').set('Cookie', user1).send({ ticketId: ticket.id }).expect(201);

    // Send a request to fetch details of the Order created above as user2
    await request(app).get(`/api/orders/${order.id}`).set('Cookie', user2).expect(401);
});

it('fetches the details for a particular Order', async () => {
    // Create a Concert Ticket 
    const ticket = Ticket.build({ title: 'concert', price: 200 });
    await ticket.save();

    // Create a User
    const user = global.signin();

    // Create a new Order as user and associate ticket with this Order
    const { body: order } = await request(app).post('/api/orders').set('Cookie', user).send({ ticketId: ticket.id }).expect(201);

    // Send a request to fetch details of the Order created above as the same user
    await request(app).get(`/api/orders/${order.id}`).set('Cookie', user).expect(200);
});