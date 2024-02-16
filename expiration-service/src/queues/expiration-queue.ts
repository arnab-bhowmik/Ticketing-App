import Queue from "bull";
import { ExpirationCompletePublisher } from '../events/publishers/expiration-complete-publisher';
import { connection, exchange } from '../index';

interface Payload {
    orderId: string;    
}

const expirationQueue = new Queue<Payload>('order.expiration', {
    redis: {
        host: process.env.REDIS_HOST
    }
});

expirationQueue.process(async (job) => {
    // Publish an event for Order Expiration
    await new ExpirationCompletePublisher(connection!,exchange).publish({
        orderId: job.data.orderId
    });
});

export { expirationQueue };