import request from "supertest";
import { app } from "../../app";

// ------------ Test Scenarios for identifying if current user is logged in ------------

it('returns details about the current user', async () => {
    const cookie = await authCookie();
    const response = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie)
    .send()
    .expect(200);

    expect(response.body.currentUser.email).toEqual('user1@abc.com');
});

it('returns null if user is not authenticated', async () => {
    const response = await request(app)
    .get('/api/users/currentuser')
    .send()
    .expect(200);

    expect(response.body.currentUser).toEqual(null);
});