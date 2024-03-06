import express from "express";
import 'express-async-errors'; 
import { json } from "body-parser";
import cookieSession from "cookie-session";

import { errorHandler, NotFoundError, currentUser } from "@ticketing_org/custom-modules";
import { createPaymentRouter } from "./routes/createPayment";

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(cookieSession({
    signed: false
    // secure: true
}));
app.use(currentUser);

app.use(createPaymentRouter);

app.get('*', async () => {
    throw new NotFoundError('Route Not Found');
});

app.use(errorHandler);

export { app };