import mongoose from "mongoose";
import { app } from "./app";
import { openRabbitMQConnection, closeRabbitMQConnection } from "@ticketing_org/custom-modules";
import { TicketCreatedListener } from "./events/listeners/ticket-created-listener";
import { TicketUpdatedListener } from "./events/listeners/ticket-updated-listener";

const queue               = 'order-service-queue';
const rabbitmqUsername    = 'example';
const rabbitmqPassword    = 'whyareyoulookinghere';
const rabbitmqService     = 'rabbitmq-cluster';
const rabbitmqServicePort = 5672;

const startUp = async () => {
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined!');
    }

    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI must be defined!');
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Successfully connected to Mongo DB');
    } catch (err) {
        console.log(err);
    }

    // Establish connection with RabbitMQ service for consuming Events. Keep the connection open.
    const connection = await openRabbitMQConnection(rabbitmqUsername,rabbitmqPassword,rabbitmqService,rabbitmqServicePort);
    if (connection) {
        console.log('Successfully established connection to RabbitMQ Service');
    }

    app.listen(3000, () => {
        console.log('Listening on port 3000!!');
    });

    // Listen for Ticket Creation events
    await new TicketCreatedListener(connection!, queue).listen();
    // Listen for Ticket Update events
    await new TicketUpdatedListener(connection!, queue).listen();
}

startUp();