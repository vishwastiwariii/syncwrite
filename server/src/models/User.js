import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
    {
        name: {
            type: String, 
            required: true, 
            trim: true, 
        }, 

        email: {
            type: String, 
            required: true, 
            trim: true, 
            unique: true, 
        }, 

        passwordHash: {
            type: String, 
            required: true, 
        }, 

        imageUrl: {
            type: String, 
            default: ""
        }, 
    } , 
    {
        timestamps: true
    }
)


export default mongoose.model("User", UserSchema)