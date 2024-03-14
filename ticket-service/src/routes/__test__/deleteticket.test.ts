import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { connection } from '../../index';

// ------------ Test Scenarios for identifying if current user is logged in and can delete tickets created by them ------------

it('returns status of 404 if the ticket is not found', async () => {
    // Create a random id which doesn't correspond to an existing Ticket
    const ticketId = new mongoose.Types.ObjectId().toHexString();
    await request(app).delete(`/api/tickets/${ticketId}`).set('Cookie', global.signin()).expect(404);
});

it('returns status of 401 if the user is not authenticated', async () => {
    // Create a random id which doesn't correspond to an existing Ticket
    const ticketId = new mongoose.Types.ObjectId().toHexString();
    await request(app).delete(`/api/tickets/${ticketId}`).expect(401);
});

it('returns status of 401 if the user is not the ticket owner', async () => {
    // Sends a Ticket Creation Request
    const response = await request(app).post('/api/tickets').set('Cookie', global.signin()).send({ title: 'Ticket_1', price: 100 });

    // Try to delete the ticket created above as a different user
    await request(app).delete(`/api/tickets/${response.body.id}`).set('Cookie', global.signin()).expect(401);
});

it('deletes the ticket provided valid inputs', async () => {
    const cookie = global.signin();
    
    // Sends a Ticket Creation Request
    const response = await request(app).post('/api/tickets').set('Cookie', cookie).send({ title: 'Ticket_1', price: 100 });

    // Try to delete the ticket created above as the same user
    await request(app).delete(`/api/tickets/${response.body.id}`).set('Cookie', cookie).expect(204);
});

it('emits ticket deleted event on successful ticket deletion', async () => {
    const cookie = global.signin();
    
    // Sends a Ticket Creation Request
    const response = await request(app).post('/api/tickets').set('Cookie', cookie).send({ title: 'Ticket_1', price: 100 });

    // Try to delete the ticket created above as the same user
    await request(app).delete(`/api/tickets/${response.body.id}`).set('Cookie', cookie).expect(204);

    // Emit event
    const channel = await connection.createChannel();
    expect(channel.publish).toHaveBeenCalled();
});

it('rejects deletion of a ticket if it is already reserved', async () => {
    const cookie = global.signin();
    
    // Sends a Ticket Creation Request
    const response = await request(app).post('/api/tickets').set('Cookie', cookie).send({ title: 'Ticket_1', price: 100 });

    const ticket = await Ticket.findById(response.body.id);
    ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
    await ticket!.save();

    // Try to delete the ticket created above as the same user
    await request(app).delete(`/api/tickets/${response.body.id}`).set('Cookie', cookie).expect(400);
});