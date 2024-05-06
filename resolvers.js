import TodoModel from "./models/todo.model.js";
import UserModel from "./models/user.model.js";
import { toIsoDate, appError } from "./utils/helperFunctions.js";
import {GraphQLError} from "graphql";
import jwt from 'jsonwebtoken';
import {createTodo, deleteTodo, getTodo, updateTodo} from "./controllers/todoControllers.js";

export const resolvers = {
    Query: {
        todo: async (_root, { id }) => {
            return getTodo({id});
        },
        user: async (_root, { id }) => {
            return await UserModel.findById(id);
        },
        todos: (_root, { userId }) => {
            return TodoModel.find({userId});
        }
    },

    Mutation: {
        createTodo: async (_root, { inputTodo }) => {
            const { description, userId, category, dueDate, subTasks } = inputTodo;
            return createTodo({description, userId, category, dueDate, subTasks});
        },
        updateTodo: (_root, { inputTodo, id }) => {
            return updateTodo({...inputTodo, id});
        },
        deleteTodo: async (_root, { id }) => {
            return deleteTodo({id});
        }
    },

    Todo: {
        comments: async ({ _id }) => {
            return await CommentsModel.find({todoId: _id});
        },
        date: (todo) => {
            return toIsoDate(todo.createdAt.toISOString());
        },
    },

    User: {
        todos: async ({_id}) => {
            return await TodoModel.find({userId: _id})
        },
    }
}
