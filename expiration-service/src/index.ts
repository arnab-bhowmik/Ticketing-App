import amqp from 'amqplib';
import { openRabbitMQConnection } from "@ticketing_org/custom-modules";
import { OrderCreatedListener } from './events/listeners/order-created-listener';

let rabbitmqUsername: string, rabbitmqPassword: string, rabbitmqService: string;
let connection: amqp.Connection;
let exchange: string, queue: string;

const startUp = async () => {
    console.log('Starting Up.....');
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

    // Establish connection with RabbitMQ service for consuming Events. Keep the connection open.
    connection = (await openRabbitMQConnection(rabbitmqUsername,rabbitmqPassword,rabbitmqService))!;
    
    // Listen for Order Creation events
    await new OrderCreatedListener(connection!, queue).listen();
}

startUp();
export { connection, exchange, queue };