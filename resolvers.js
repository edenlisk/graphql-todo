import TodoModel from "./models/todo.model.js";
import CommentsModel from "./models/comments.model.js";
import UserModel from "./models/user.model.js";
import {GraphQLError} from "graphql";
import jwt from 'jsonwebtoken';

export const resolvers = {
    Query: {
        todo: async (_root, { id }) => {
            return await TodoModel.findById(id);
        },
        user: async (_root, { id }) => {
            return await UserModel.findById(id);
        }
    },

    Mutation: {
        signup: async (_root, { inputUser: { name, username, password } }) => {
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
        },
        login: async (_root, { inputLogin: { username, password }}) => {
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
        },
        createTodo: async (_root, { inputTodo }) => {
            const { title, description, userId ,date } = inputTodo;
            const createdTodo = await TodoModel.create(
                {
                    title,
                    description,
                    userId,
                    isCompleted: false
                }
            )

            return {
                id: createdTodo._id,
                ...createdTodo._doc
            };
        },
        updateTodo: async (_root, { inputTodo, id }) => {
            const todo = await TodoModel.findById(id);
            if (!todo) throw appError("No todo with " + id, "BAD_INPUT");
            if (inputTodo.title) todo.title = inputTodo.title;
            if (inputTodo.description) todo.description = inputTodo.description;
            if (inputTodo.isCompleted) todo.isCompleted = inputTodo.isCompleted;
            await todo.save({validateModifiedOnly: true});
            return {
                id: todo._id,
                ...todo._doc
            };
        },
        deleteTodo: async (_root, { id }) => {
            const deletedTodo = await TodoModel.findByIdAndDelete(id);
            return !!deletedTodo;
        },
        addComment: async (_root, { id, inputComment: { message } }) => {
            const newComment = await CommentsModel.create(
                {
                    message
                }
            )
            return {
                id: newComment._id,
                ...newComment._doc
            }
        },
        deleteComment: async (_root, { id }) => {
            const deletedComment = await CommentsModel.findByIdAndDelete(id);
            return !!deletedComment;
        }
    },

    Todo: {
        comments: async ({ _id }) => {
            return await CommentsModel.find({todoId: _id});
        },
        date: (todo) => {
            return toIsoDate(todo.createdAt.toISOString());
        }
    },

    User: {
        todos: async ({_id}) => {
            return await TodoModel.find({userId: _id})
        }
    }
}

function appError(message, code) {
    return new GraphQLError(message, { extensions: { code} });
}

function toIsoDate(date) {
    return date.slice(0, 'yyyy-mm-dd'.length);
}

const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET_KEY, {expiresIn: process.env.EXPIRES_IN});
}

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
