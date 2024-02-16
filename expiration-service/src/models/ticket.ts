import mongoose from "mongoose";
import { updateIfCurrentPlugin } from 'mongoose-update-if-current'; 

// Interface to define the properties the Ticket Schema has
interface TicketAttribute {
    title: string,
    price: number,
    userId: string
}

// Interface to define the properties the Ticket Document has
interface TicketDoc extends mongoose.Document {
    title: string,  
    price: number,
    userId: string,
    orderId?: string,
    version: number
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
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    orderId: {
        type: String
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
    return new Ticket(attribute);
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };