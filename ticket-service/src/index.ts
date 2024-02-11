import mongoose from "mongoose";
import { app } from "./app";
import { openRabbitMQConnection, closeRabbitMQConnection } from "@ticketing_org/custom-modules";

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

    const rabbitmqUsername    = process.env.RABBITMQ_USERNAME;
    const rabbitmqPassword    = process.env.RABBITMQ_PASSWORD;
    const rabbitmqService     = process.env.RABBITMQ_SERVICE;
    const exchange            = process.env.RABBITMQ_EXCHANGE;
    const queue               = process.env.RABBITMQ_QUEUE;

    // Establish connection with RabbitMQ service for consuming Events. Keep the connection open.
    const connection = await openRabbitMQConnection(rabbitmqUsername,rabbitmqPassword,rabbitmqService);
    if (connection) {
        console.log('Successfully established connection to RabbitMQ Service');
    }

    app.listen(3000, () => {
        console.log('Listening on port 3000!!');
    });

    // TO-DO SECTION
    // // Listen for Order Creation events
    // await new OrderCreatedListener(connection!, queue).listen();
    // // Listen for Order Cancellation events
    // await new OrderCancelledListener(connection!, queue).listen();
}

startUp();