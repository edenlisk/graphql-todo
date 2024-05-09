import TodoModel from "./models/todo.model.js";
import {appError, toIsoDate} from "./utils/helperFunctions.js";
import {createTodo, deleteTodo, getTodo, updateTodo} from "./controllers/todoControllers.js";

export const resolvers = {
    Query: {
        todo: async (_root, { id }, { auth } ) => {
            if (!auth) throw appError("Missing Authentication", "UNAUTHENTICATED");
            return getTodo({id});
        },
        todos: async (_root, { userId }) => {
            return await TodoModel.find({userId});
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
        date: (todo) => {
            return toIsoDate(todo.createdAt.toISOString());
        },
    },

}
