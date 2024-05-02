import mongoose, {Schema, model} from "mongoose";


const commentSchema = new Schema(
    {
        todoId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Todo'
        },
        message: String
    }, {
        timestamps: true
    }
)

export default model('Comment', commentSchema);