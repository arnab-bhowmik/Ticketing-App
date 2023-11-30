import express from "express";
import 'express-async-errors'; 
import { json } from "body-parser";
import cookieSession from "cookie-session";

import { errorHandler, NotFoundError } from "@ticketing_org/custom-modules";

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(cookieSession({
    signed: false
    // secure: true
}));

app.get('*', async () => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };