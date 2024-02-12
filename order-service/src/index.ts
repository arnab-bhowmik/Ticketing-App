import amqp from 'amqplib';
import mongoose from "mongoose";
import { app } from "./app";
import { openRabbitMQConnection } from "@ticketing_org/custom-modules";
import { TicketCreatedListener } from "./events/listeners/ticket-created-listener";
import { TicketUpdatedListener } from "./events/listeners/ticket-updated-listener";

let connection: amqp.Connection;

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

    if (!process.env.RABBITMQ_USERNAME) {
        throw new Error('RABBITMQ_USERNAME must be defined!');
    }
    if (!process.env.RABBITMQ_PASSWORD) {
        throw new Error('RABBITMQ_PASSWORD must be defined!');
    }
    if (!process.env.RABBITMQ_SERVICE) {
        throw new Error('RABBITMQ_SERVICE must be defined!');
    }
    if (!process.env.RABBITMQ_EXCHANGE) {
        throw new Error('RABBITMQ_EXCHANGE must be defined!');
    }
    if (!process.env.RABBITMQ_QUEUE) {
        throw new Error('RABBITMQ_QUEUE must be defined!');
    }

    const rabbitmqUsername = process.env.RABBITMQ_USERNAME;
    const rabbitmqPassword = process.env.RABBITMQ_PASSWORD;
    const rabbitmqService  = process.env.RABBITMQ_SERVICE;
    const exchange         = process.env.RABBITMQ_EXCHANGE;
    const queue            = process.env.RABBITMQ_QUEUE;

    app.listen(3000, () => {
        console.log('Listening on port 3000!!');
    });

    // Establish connection with RabbitMQ service for consuming Events. Keep the connection open.
    connection = (await openRabbitMQConnection(rabbitmqUsername,rabbitmqPassword,rabbitmqService))!;
    
    // Listen for Ticket Creation events
    await new TicketCreatedListener(connection!, queue).listen();
    // Listen for Ticket Update events
    await new TicketUpdatedListener(connection!, queue).listen();
}

startUp();
export { connection };