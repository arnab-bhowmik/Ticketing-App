import request from "supertest";
import { app } from "../../app";

// ------------ Test Scenarios for identifying if current user is logged in ------------

it('returns details about the current user', async () => {
    const signupResponse = await request(app)
    .post('/api/users/signup')
    .send({ 
        email: 'user2@abc.com', 
        password: 'abc123' 
    })
    .expect(201);
    const cookie = signupResponse.get('Set-Cookie');

    const response = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie)
    .send()
    .expect(200);

    expect(response.body.currentUser.email).toEqual('user2@abc.com');
});