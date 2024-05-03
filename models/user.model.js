import { Schema, model } from "mongoose";
import * as bcrypt from 'bcrypt';



const userSchema = new Schema(
    {
        name: String,
        password: {
            type: String,
            required: true,
            select: false
        },
        username: {
            type: String
        }
    },
    {
        timestamps: true
    }
)


userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});


userSchema.methods.verifyPassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
}

export default model('User', userSchema);