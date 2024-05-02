import { Schema, model } from "mongoose";



const userSchema = new Schema(
    {
        name: String,
        password: {
            type: String,
            required: true
        },
        username: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

export default model('User', userSchema);