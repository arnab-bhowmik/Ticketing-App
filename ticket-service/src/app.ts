import express from "express";
import 'express-async-errors'; 
import { json } from "body-parser";
import cookieSession from "cookie-session";

import { errorHandler, NotFoundError, currentUser } from "@ticketing_org/custom-modules";
import { createTicketRouter } from "./routes/createticket";
import { showTicketRouter } from "./routes/showticket";

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(cookieSession({
    signed: false
    // secure: true
}));
app.use(currentUser);

app.use(createTicketRouter);
app.use(showTicketRouter);

app.get('*', async () => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };