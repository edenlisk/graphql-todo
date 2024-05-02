import mongoose, { Schema, model } from 'mongoose';


const todoSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: String,
    description: String,
    isCompleted: Boolean
}, {
    timestamps: true
})

export default model('Todo', todoSchema);