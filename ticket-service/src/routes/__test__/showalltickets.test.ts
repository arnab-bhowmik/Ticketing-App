import request from "supertest";
import { app } from "../../app";

// ------------ Test Scenarios for identifying if any user can see all tickets ------------

it('can fetch list of all tickets', async () => {
    // Sends multiple Ticket Creation Requests
    await request(app).post('/api/tickets').set('Cookie', global.signin()).send({ title: 'Ticket_1', price: 100 }).expect(201);
    await request(app).post('/api/tickets').set('Cookie', global.signin()).send({ title: 'Ticket_2', price: 200 }).expect(201);
    await request(app).post('/api/tickets').set('Cookie', global.signin()).send({ title: 'Ticket_3', price: 300 }).expect(201);

    // Retrieves the details for all the Tickets
    const response = await request(app).get('/api/tickets/').send();

    // Validate the ticket count in Mongo Collection
    expect(response.body.length).toEqual(3);
});