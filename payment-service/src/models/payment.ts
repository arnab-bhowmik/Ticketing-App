import mongoose from "mongoose";
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

// Interface to define the properties the Payment Schema has
interface PaymentAttribute {
    rzpPaymentId: string,
    orderId: string
}

// Interface to define the properties the Payment Document has
interface PaymentDoc extends mongoose.Document {
    rzpPaymentId: string,
    orderId: string,
    version: number
}

// Interface to define the properties the Payment Model has
interface PaymentModel extends mongoose.Model<PaymentDoc> {
    build(attribute: PaymentAttribute): PaymentDoc;
}

const paymentSchema = new mongoose.Schema({
    rzpPaymentId: {
        type: String,
        required: true
    },
    orderId: {
        type: String,
        required: true
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
paymentSchema.set('versionKey','version');
// Use the imported mongoose npm library 
paymentSchema.plugin(updateIfCurrentPlugin);

paymentSchema.statics.build = (attribute: PaymentAttribute) => {
    return new Payment(attribute);
}

const Payment = mongoose.model<PaymentDoc, PaymentModel>('Payment', paymentSchema);

export { Payment };