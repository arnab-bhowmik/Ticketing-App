import request from "supertest";
import { app } from "../../app";

// ------------ Test Scenarios for identifying if any user can see all tickets ------------

const createTicket = () => {
    return request(app).post('/api/tickets').set('Cookie', global.signin()).send({ title: 'Ticket_2', price: 200 });
}

it('can fetch list of all tickets', async () => {
    // Sends a Ticket Creation Request
    await createTicket();
    await createTicket();
    await createTicket();

    // Retrieves the details for all the Tickets
    const response = await request(app).get('/api/tickets/').send().expect(200);

    // Validate the ticket count in Mongo Collection
    expect(response.body.length).toEqual(3);
});