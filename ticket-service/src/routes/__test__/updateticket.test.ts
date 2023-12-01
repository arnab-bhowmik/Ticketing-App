import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";

// ------------ Test Scenarios for identifying if current user is logged in and can update tickets created by them ------------

it('returns status of 404 if the ticket is not found', async () => {
    // Create a random id which doesn't correspond to an existing Ticket
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app).put(`/api/tickets/${id}`).set('Cookie', global.signin()).send({ title: 'Ticket_2', price: 200 }).expect(404);
});

it('returns status of 401 if the user is not authenticated', async () => {
    // Create a random id which doesn't correspond to an existing Ticket
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app).put(`/api/tickets/${id}`).send({ title: 'Ticket_2', price: 200 }).expect(401);
});

it('returns status of 401 if the user is not the ticket owner', async () => {
    // Sends a Ticket Creation Request
    const response = await request(app).post('/api/tickets').set('Cookie', global.signin()).send({ title: 'Ticket_2', price: 200 });

    // Try to update the ticket created above as a different user
    await request(app).put(`/api/tickets/${response.body.id}`).set('Cookie', global.signin()).send({ title: 'Ticket_2', price: 250 }).expect(401);
});

it('returns status of 400 if the user provides an invalid Ticket title or price', async () => {
    const cookie = global.signin();
    
    // Sends a Ticket Creation Request
    const response = await request(app).post('/api/tickets').set('Cookie', cookie).send({ title: 'Ticket_2', price: 200 });

    // Try to update the ticket created above as the same user but with invalid title
    await request(app).put(`/api/tickets/${response.body.id}`).set('Cookie', cookie).send({ title: '', price: 250 }).expect(400);

    // Try to update the ticket created above as the same user but with invalid price
    await request(app).put(`/api/tickets/${response.body.id}`).set('Cookie', cookie).send({ title: 'Ticket_3', price: -250 }).expect(400);

});

it('updates the ticket provided valid inputs', async () => {
    const cookie = global.signin();
    
    // Sends a Ticket Creation Request
    const response = await request(app).post('/api/tickets').set('Cookie', cookie).send({ title: 'Ticket_2', price: 200 });

    // Try to update the ticket created above as the same user with valid details
    await request(app).put(`/api/tickets/${response.body.id}`).set('Cookie', cookie).send({ title: 'Ticket_3', price: 250 }).expect(200);

    // Fetch the Ticket details to confirm the updates are showing up
    const ticketDetails = await request(app).get(`/api/tickets/${response.body.id}`).send();

    // Validate the ticket details in Mongo Collection
    expect(ticketDetails.body.title).toEqual('Ticket_3');
    expect(ticketDetails.body.price).toEqual(250);
});