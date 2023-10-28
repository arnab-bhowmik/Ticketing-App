import mongoose from "mongoose";
import { Password } from "../services/password-hashing";

//Interface to define the properties the User Schema has
interface UserAttribute {
    email: string,
    password: string
}

//Interface to define the properties the User Model has
interface UserModel extends mongoose.Model<UserDoc> {
    build(attribute: UserAttribute): UserDoc;
}

//Interface to define the properties the User Document has
interface UserDoc extends mongoose.Document {
    email: string,
    password: string
}

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

userSchema.pre('save', async function(done) {
    if (this.isModified('password')) {
        const hashedPassword = await Password.toHash(this.get('password'));
        this.set('password', hashedPassword);
    }
    done();
});

userSchema.statics.build = (attribute: UserAttribute) => {
    return new User(attribute);
}

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };