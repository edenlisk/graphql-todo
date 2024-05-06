import UserModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN + 20 * 60 * 60 * 1000),
        httpOnly: true
    }
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions);
    res
        .status(statusCode)
        .json(
            {
                status: "Success",
                token,
                data: {
                    user
                }
            }
        )
    ;
}
const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET_KEY, {expiresIn: process.env.EXPIRES_IN});
}


export async function signup({ name, username, password }) {
    const existingUser = await UserModel.findOne({username});
    if (existingUser) throw appError("User with " + username + " already exists", "BAD_REQUEST");
    const user = await UserModel.create(
        {
            name,
            username,
            password
        }
    )
    return {
        id: user._id,
        ...user._doc
    }
}

export async function login({username, password}) {
    if (!username || password) throw appError("username or password is missing", "BAD_INPUTS");
    const user = await UserModel.findOne({username}).select('+password');
    if (!user || !(await user.verifyPassword(password))) {
        throw appError("Invalid username or password", "BAD_INPUTS");
    }
    user.password = undefined;
    const token = signToken(user._id);
    return {
        token,
        id: user._id,
        ...user._doc
    }
}