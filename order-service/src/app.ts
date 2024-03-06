import express from "express";
import 'express-async-errors'; 
import { json } from "body-parser";
import cookieSession from "cookie-session";

import { errorHandler, NotFoundError, currentUser } from "@ticketing_org/custom-modules";
import { createOrderRouter } from "./routes/createorder";
import { showOrderRouter } from "./routes/showorder";
import { showAllOrdersRouter } from "./routes/showallorders";
import { cancelOrderRouter } from "./routes/cancelorder";

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(cookieSession({
    signed: false
    // secure: true
}));
app.use(currentUser);

app.use(createOrderRouter);
app.use(showOrderRouter);
app.use(showAllOrdersRouter);
app.use(cancelOrderRouter);

app.get('*', async () => {
    throw new NotFoundError('Route Not Found');
});

app.use(errorHandler);

export { app };