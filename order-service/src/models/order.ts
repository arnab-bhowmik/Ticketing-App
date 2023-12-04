import mongoose from "mongoose";

// Interface to define the properties the Order Schema has
interface OrderAttribute {
    userId: string,
    status: string,
    expiresAt: Date,
    ticket: TicketDoc
}

// Interface to define the properties the Order Document has
interface OrderDoc extends mongoose.Document {
    userId: string,
    status: string,
    expiresAt: Date,
    ticket: TicketDoc
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
    status: {
        type: String,
        required: true
    },
    expiresAt: {
        type: mongoose.Schema.Types.Date,
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

orderSchema.statics.build = (attribute: OrderAttribute) => {
    return new Order(attribute);
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };