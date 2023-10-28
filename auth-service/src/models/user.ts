import mongoose from "mongoose";

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
userSchema.statics.build = (attribute: UserAttribute) => {
    return new User(attribute);
}

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

// Sample Test Code!
// const user = User.build({
//     email: '',
//     password: '' 
// });

// user.email
// user.password


export { User };