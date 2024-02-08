import mongoose from "mongoose";
import { app } from "./app";
import { TicketCreatedListener } from "./events/listeners/ticket-created-listener";
import { TicketUpdatedListener } from "./events/listeners/ticket-updated-listener";

const exchange                  = 'rabbitmq-exchange';
const key                       = 'ticket.created';
const queue                     = 'rabbitmq-queue';
const rabbitmq_username         = 'example';
const rabbitmq_password         = 'whyareyoulookinghere';
const rabbitmq_k8s_service      = 'rabbitmq-cluster';
const rabbitmq_k8s_service_port = 5672;

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

    app.listen(3000, () => {
        console.log('Listening on port 3000!!');
    });

    // Listen for an event for Ticket Creation so as to update the Ticket Collection under Order Service
    function TicketCreateListenerWrapper() {
        new TicketCreatedListener(exchange,key,queue,rabbitmq_username,rabbitmq_password,rabbitmq_k8s_service,rabbitmq_k8s_service_port).listen();
    }
    // Listen for an event for Ticket Update so as to update the Ticket Collection under Order Service
    function TicketUpdateListenerWrapper() {
        new TicketUpdatedListener(exchange,key,queue,rabbitmq_username,rabbitmq_password,rabbitmq_k8s_service,rabbitmq_k8s_service_port).listen();
    }

    setInterval(TicketCreateListenerWrapper, 5000);
    setInterval(TicketUpdateListenerWrapper, 5000);
}

startUp();