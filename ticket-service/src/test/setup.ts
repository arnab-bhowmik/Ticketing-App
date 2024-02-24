import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
    namespace NodeJS {
        interface Global {
            signin() : string[];
        } 
    }
}

// Incorporate mock implementation of __mocks__/index.ts 
jest.mock('../index');

let mongo: any;
process.env.JWT_KEY = 'fgfhjhukhbdxhgjhk';

// Execute the function at the beginning of a Test Cycle
beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri, {})
});

// Execute the function before each Test within a Test Cycle
beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();
    // Clear out all Mongo Collections 
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
global.signin = () => {

    // Build a JWT Payload - { id, email }
    const payload = {
        id: new mongoose.Types.ObjectId().toHexString(),
        name: 'User1',
        email: 'user1@abc.com'
    };

    // Create the JWT!
    const token = jwt.sign(payload, process.env.JWT_KEY!);

    // Build Session Object { jwt: JWT_KEY }
    const session = { jwt: token };

    // Turn that session into JSON
    const sessionJSON = JSON.stringify(session);

    // Take session JSON and encode it as base64
    const base64 = Buffer.from(sessionJSON).toString('base64');

    // Return string containing the base64 encoded cookie
    return [`session=${base64}`];
};