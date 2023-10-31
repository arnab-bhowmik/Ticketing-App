import request from "supertest";
import { app } from "../../app";

// ------------ Test Scenarios for Sign Out ------------

it('returns a 200 on successful Sign Out and clears the cookie containing the Json Web Token', async () => {
    await request(app)
    .post('/api/users/signup')
    .send({ 
        email: 'user1@abc.com', 
        password: 'abc123' 
    })
    .expect(201);

    const response = await request(app)
    .post('/api/users/signout')
    .send({})
    .expect(200);

    console.log(response.get('Set-Cookie'));
    expect(response.get('Set-Cookie')[0]).toEqual('session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly');
});