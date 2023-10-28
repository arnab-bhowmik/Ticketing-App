import express from "express";
import 'express-async-errors'; 
import { json } from "body-parser";
import mongoose from "mongoose";

import { currentUserRouter } from "./routes/currentuser";
import { signUpRouter } from "./routes/signup";
import { signInRouter } from "./routes/signin";
import { signOutRouter } from "./routes/signout";
import { errorHandler } from "./middlewares/error-handler";
import { NotFoundError } from "./errors/not-found-errors";

const app = express();
app.use(json());

app.use(currentUserRouter);
app.use(signUpRouter);
app.use(signInRouter);
app.use(signOutRouter);

app.get('*', async () => {
    throw new NotFoundError();
});

app.use(errorHandler);

const startUp = async () => {
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