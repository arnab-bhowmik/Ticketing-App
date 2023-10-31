import request from "supertest";
import { app } from "../../app";

// ------------ Test Scenarios for SignUp ------------

it('returns a 400 for an invalid email entered at Sign Up', async () => {
    await request(app)
    .post('/api/users/signup')
    .send({ 
        email: 'bjknlml', 
        password: 'abc123' 
    })
    .expect(400);
});

it('returns a 400 for an invalid password entered at Sign Up', async () => {
    await request(app)
    .post('/api/users/signup')
    .send({ 
        email: 'user1@abc.com', 
        password: 'abc' 
    })
    .expect(400);
});

it('returns a 400 for missing email and/or password at Sign Up', async () => {
    await request(app)
    .post('/api/users/signup')
    .send({ 
        email: '', 
        password: 'abc123' 
    })
    .expect(400);

    await request(app)
    .post('/api/users/signup')
    .send({ 
        email: 'user1@abc.com', 
        password: '' 
    })
    .expect(400);
    
    await request(app)
    .post('/api/users/signup')
    .send({ 
        email: '', 
        password: '' 
    })
    .expect(400);
});

it('returns a 201 on successful signup', async () => {
    await request(app)
    .post('/api/users/signup')
    .send({ 
        email: 'user1@abc.com', 
        password: 'abc123' 
    })
    .expect(201);
});

it('does not allow to enter an already registered email at Sign Up', async () => {
    await request(app)
    .post('/api/users/signup')
    .send({ 
        email: 'user1@abc.com', 
        password: 'abc123' 
    })
    .expect(201);

    await request(app)
    .post('/api/users/signup')
    .send({
        email: 'user1@abc.com', 
        password: 'abc123' 
    })
    .expect(400);
});

it('sets a cookie containing the Json Web Token after successful Sign Up', async () => {
    const response = await request(app)
    .post('/api/users/signup')
    .send({ 
        email: 'user1@abc.com', 
        password: 'abc123' 
    })
    .expect(201);

    expect(response.get('Set-Cookie')).toBeDefined();
});