import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";

// ------------ Test Scenarios for identifying if current user is logged in and can see tickets ------------

it('returns status of 404 if the ticket is not found', async () => {
    // Create a random id which doesn't correspond to an existing Ticket
    const ticketId = new mongoose.Types.ObjectId().toHexString();
    await request(app).get(`/api/tickets/${ticketId}`).send().expect(404);
});

it('returns the ticket if the ticket is found', async () => {
    // Sends a Ticket Creation Request
    const response = await request(app).post('/api/tickets').set('Cookie', global.signin()).send({ title: 'Ticket_1', price: 100 });

    // Retrieves the Ticket Id from the above request and sends a request to fetch the relevant details
    const ticketDetails = await request(app).get(`/api/tickets/${response.body.id}`).send();

    // Validate the ticket details in Mongo Collection
    expect(ticketDetails.body.title).toEqual('Ticket_1');
    expect(ticketDetails.body.price).toEqual(100);
});