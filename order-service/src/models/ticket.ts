import mongoose from "mongoose";
import { Order, OrderStatus } from '../models/order';

// Interface to define the properties the Ticket Schema has
interface TicketAttribute {
    title: string,
    price: number
}

// Interface to define the properties the Ticket Document has
export interface TicketDoc extends mongoose.Document {
    title: string
    price: number
    isReserved(): Promise<boolean>
}

// Interface to define the properties the Ticket Model has
interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attribute: TicketAttribute): TicketDoc;
}

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    // Convert Ticket schema to JSON and omit/update prperties in the response
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

ticketSchema.statics.build = (attribute: TicketAttribute) => {
    return new Ticket(attribute);
}

// Define the logic for marking a ticket as reserved
ticketSchema.methods.isReserved = async function() {
    const existingOrder = await Order.findOne({
        ticket: this,
        status: {
            $in: [
                OrderStatus.Created,
                OrderStatus.AwaitingPayment,
                OrderStatus.Complete
            ]
        }
    });
    // Converts the ouput to boolean True or False depending on whether there is an existing order found
    return !!existingOrder;
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };