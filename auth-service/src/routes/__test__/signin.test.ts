import request from "supertest";
import { app } from "../../app";

// ------------ Test Scenarios for Sign In ------------

it('returns a 400 for an invalid email entered at Sign In', async () => {
    await request(app)
    .post('/api/users/signin')
    .send({ 
        email: 'bjknlml', 
        password: 'abc123' 
    })
    .expect(400);
});

it('returns a 400 for an invalid/incorrect password entered at Sign In', async () => {
    await request(app)
    .post('/api/users/signup')
    .send({ 
        email: 'user2@abc.com', 
        password: 'abc123' 
    })
    .expect(201);
    
    await request(app)
    .post('/api/users/signin')
    .send({ 
        email: 'user2@abc.com', 
        password: 'abc' 
    })
    .expect(400);
});

it('returns a 400 for missing email and/or password at Sign In', async () => {
    await request(app)
    .post('/api/users/signin')
    .send({ 
        email: '', 
        password: 'abc123' 
    })
    .expect(400);

    await request(app)
    .post('/api/users/signin')
    .send({ 
        email: 'user2@abc.com', 
        password: '' 
    })
    .expect(400);
    
    await request(app)
    .post('/api/users/signin')
    .send({ 
        email: '', 
        password: '' 
    })
    .expect(400);
});

it('returns a 200 on successful Sign In and sets a cookie containing the Json Web Token', async () => {
    await request(app)
    .post('/api/users/signup')
    .send({ 
        email: 'user2@abc.com', 
        password: 'abc123' 
    })
    .expect(201);

    const response = await request(app)
    .post('/api/users/signin')
    .send({
        email: 'user2@abc.com', 
        password: 'abc123' 
    })
    .expect(200);

    expect(response.get('Set-Cookie')).toBeDefined();
});