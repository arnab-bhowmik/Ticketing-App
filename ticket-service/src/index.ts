import amqp from 'amqplib';
import mongoose from "mongoose";
import { app } from "./app";
import { openRabbitMQConnection } from "@ticketing_org/custom-modules";

let rabbitmqUsername: string, rabbitmqPassword: string, rabbitmqService: string;
let connection: amqp.Connection;
let exchange: string, queue: string;

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

    rabbitmqUsername = process.env.RABBITMQ_USERNAME;
    rabbitmqPassword = process.env.RABBITMQ_PASSWORD;
    rabbitmqService  = process.env.RABBITMQ_SERVICE;
    exchange         = process.env.RABBITMQ_EXCHANGE;
    queue            = process.env.RABBITMQ_QUEUE;

    app.listen(3000, () => {
        console.log('Listening on port 3000!!');
    });

    // Establish connection with RabbitMQ service for consuming Events. Keep the connection open.
    connection = (await openRabbitMQConnection(rabbitmqUsername,rabbitmqPassword,rabbitmqService))!;
    
    // // Listen for Order Creation events
    // await new OrderCreatedListener(connection!, queue).listen();
    // // Listen for Order Cancellation events
    // await new OrderCancelledListener(connection!, queue).listen();
}

startUp();
export { connection, exchange, queue };