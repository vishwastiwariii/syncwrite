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

        // Optional: Google-only accounts have no local password.
        passwordHash: {
            type: String,
        },

        // Google's stable user id (the ID token's `sub`). Sparse+unique so
        // password-only users (no googleId) don't collide on the unique index.
        googleId: {
            type: String,
            unique: true,
            sparse: true,
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