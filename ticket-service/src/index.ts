import mongoose from "mongoose";
import { app } from "./app";

const startUp = async () => {
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined!');
    }

    try {
        await mongoose.connect('mongodb://auth-mongo-service:27017/authorization');
        console.log('Successfully connected to Mongo DB');
    } catch (err) {
        console.log(err);
    }

    app.listen(3000, () => {
        console.log('Listening on port 3000!!');
    });
}

startUp();