import mongoose, { Schema } from "mongoose";

const DocumentSchema = new Schema(
    {
        title: {
            type: String, 
            required: true, 
            trim: true, 
        }, 

        content: {
            type: String, 
        }, 

        createdBy: {
            type: Schema.Types.ObjectId, 
            ref: "User", 
            required: true, 
        }, 

        collaborators: [{
            userId: {
                type: Schema.Types.ObjectId, 
                ref: "User", 
            }, 
            role: {
                type: String, 
                enum: ["EDITOR", "VIEWER"], 
                default: "VIEWER", 
            }
        }], 
        
        version: {
            type: Number, 
            required: true, 
            trim: true, 
        }
    }, 
    {
        timestamps: true
    }
)

export default mongoose.model("Document", DocumentSchema)