import request from "supertest";
import { app } from "../../app";

// ------------ Test Scenarios for identifying if current user is logged in and can create tickets ------------

it('has a route handler listening to /api/tickets for POST requests', async () => {
    const response = await request(app).post('/api/tickets').send({});
    expect(response.status).not.toEqual(404);
});

it('can only be accessed if the User is signed in', async () => {
    await request(app).post('/api/tickets').send({}).expect(401);
});

it('returns status other than 401 for signed in users', async () => {
    const response = await request(app).post('/api/tickets').set('Cookie', global.signin()).send({});
    expect(response.status).not.toEqual(401);
});

it('returns an error if an invalid title is provided', async () => {
    await request(app).post('/api/tickets').set('Cookie', global.signin()).send({ title: '', price: 100 }).expect(400);
    await request(app).post('/api/tickets').set('Cookie', global.signin()).send({ price: 100 }).expect(400);
});

it('returns an error if an invalid price is provided', async () => {
    await request(app).post('/api/tickets').set('Cookie', global.signin()).send({ title: 'Ticket_1', price: -100 }).expect(400);
    await request(app).post('/api/tickets').set('Cookie', global.signin()).send({ title: 'Ticket_1' }).expect(400);
});

it('creates a ticket with valid parameters', async () => {
    await request(app).post('/api/tickets').set('Cookie', global.signin()).send({ title: 'Ticket_1', price: 100 }).expect(201);
});