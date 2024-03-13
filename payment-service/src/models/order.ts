import mongoose from "mongoose";
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { OrderStatus } from "@ticketing_org/custom-modules";
import { TicketDoc } from "./ticket";

// Interface to define the properties the Order Schema has
interface OrderAttribute {
    id: string,
    userId: string,
    userEmail: string,
    status: OrderStatus,
    rzpOrderId: string,
    ticket: TicketDoc,
    version: number
}

// Interface to define the properties the Order Document has
interface OrderDoc extends mongoose.Document {
    userId: string,
    userEmail: string,
    status: OrderStatus,
    rzpOrderId: string,
    ticket: TicketDoc,
    version: number
}

// Interface to define the properties the Order Model has
interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attribute: OrderAttribute): OrderDoc;
}

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: Object.values(OrderStatus)
    },
    rzpOrderId: {
        type: String,
        required: true
    },
    ticket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket'
    }
}, {
    // Convert Order schema to JSON and omit/update prperties in the response
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

// Let Mongoose use 'version' as the version key instead of the default '__v'
orderSchema.set('versionKey','version');
// Use the imported mongoose npm library 
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attribute: OrderAttribute) => {
    return new Order({
        _id: attribute.id,
        userId: attribute.userId,
        userEmail: attribute.userEmail,
        status: attribute.status,
        rzpOrderId: attribute.rzpOrderId,
        ticket: attribute.ticket,
        version: attribute.version
    });
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order, OrderStatus };