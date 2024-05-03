import TodoModel from "./models/todo.model.js";
import CommentsModel from "./models/comments.model.js";
import UserModel from "./models/user.model.js";
import {GraphQLError} from "graphql";
import jwt from 'jsonwebtoken';

export const resolvers = {
    Query: {
        todo: (_root, { id }) => {
            return TodoModel.findById(id);
        },
        user: (_root, { id }) => {
            return UserModel.findById(id);
        }
    },

    Mutation: {
        signup: async (_root, { inputUser: { name, username, password } }) => {
            const existingUser = await UserModel.findOne({username});
            if (existingUser) throw badRequest("User with " + username + " already exists", "BAD_REQUEST");
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
            if (!username || password) throw badRequest("username or password is missing", "BAD_INPUTS");
            const user = await UserModel.findOne({username}).select('+password');
            if (!user || !(await user.verifyPassword(password))) {
                throw badRequest("Invalid username or password", "BAD_INPUTS");
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
            const { title, description, date } = inputTodo;
            const createdTodo = await TodoModel.create(
                {
                    title,
                    description,
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
            if (!todo) throw new Error('Nooooooooo');
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
        comments: ({todoId}) => {
            return CommentsModel.find({todoId});
        },
        date: (todo) => {
            return toIsoDate(todo.createdAt);
        }
    },

    User: {
        todos: ({ userId }) => {
            return TodoModel.find({userId})
        }
    }
}

function badRequest(message, code) {
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
