import mongoose from "mongoose";

//Interface to define the properties required for a User Schema
interface UserAttribute {
    email: string,
    password: string
}

//Interface to define the properties the User Model has
interface UserModel extends mongoose.Model<any> {
    build(attribute: UserAttribute): any;
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
userSchema.statics.build = (attribute: UserAttribute) => {
    return new User(attribute);
}

const User = mongoose.model<any, UserModel>('User', userSchema);


export { User };