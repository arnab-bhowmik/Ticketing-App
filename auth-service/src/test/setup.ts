import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from "supertest";
import { app } from '../app';

declare global {
    var authCookie: () => Promise<string[]>;
}

let mongo: any;

// Execute the function at the beginning of a Test Cycle
beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri, {})
});

// Execute the function before each Test within a Test Cycle
beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

// Execute the function at the end of a Test Cycle
afterAll(async () => {
    if (mongo) {
      await mongo.stop();
    }
    await mongoose.connection.close();
});

// Have a cookie created on User Sign Up to be used by other test scripts 
global.authCookie = async () => {
    const email = 'user1@abc.com';
    const password = 'abc123';

    const response = await request(app)
    .post('/api/users/signup')
    .send({ email, password })
    .expect(201);

    const cookie = response.get('Set-Cookie');
    return cookie;
};