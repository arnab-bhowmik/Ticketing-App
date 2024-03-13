import mongoose from "mongoose";
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { Order, OrderStatus } from '../models/order';

// Interface to define the properties the Ticket Schema has
interface TicketAttribute {
    id: string,
    title: string,
    price: number,
    userId: string,
    userEmail: string
}

// Interface to define the properties the Ticket Document has
export interface TicketDoc extends mongoose.Document {
    title: string,
    price: number,
    userId: string,
    userEmail: string,
    version: number,
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
    },
    userId: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
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

// Let Mongoose use 'version' as the version key instead of the default '__v'
ticketSchema.set('versionKey','version');
// Use the imported mongoose npm library 
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (attribute: TicketAttribute) => {
    // return new Ticket(attribute);
    return new Ticket({
        _id: attribute.id,
        title: attribute.title,
        price: attribute.price,
        userId: attribute.userId,
        userEmail: attribute.userEmail
    });
}

// Define the logic for marking a ticket as reserved
ticketSchema.methods.isReserved = async function() {
    const existingOrder = await Order.findOne({
        ticket: this,
        status: {
            $in: [
                OrderStatus.Created,
                OrderStatus.Completed
            ]
        }
    });
    // Converts the ouput to boolean True or False depending on whether there is an existing order found
    return !!existingOrder;
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };