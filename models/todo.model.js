import mongoose, { Schema, model } from 'mongoose';


const todoSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    description: String,
    isCompleted: {
        type: Boolean,
        default: false
    },
    category: String,
    subTasks: {
        type: [
            {
                description: String,
                isCompleted: Boolean
            }
        ]
    },
    dueDate: {
        type: Date,
        validate: [
            {
                validator: function (value) {
                    return value >= new Date();
                },
                message: "Due date cannot be in past"
            }
        ]
    }
}, {
    timestamps: true
})

export default model('Todo', todoSchema);