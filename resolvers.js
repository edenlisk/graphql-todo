import {appError, toIsoDate} from "./utils/helperFunctions.js";
import {createTodo, deleteTodo, getTodo, getTodos, updateTodo} from "./controllers/todoControllers.js";

export const resolvers = {
    Query: {
        todo: async (_root, { id }, { auth } ) => {
            if (!auth) throw appError("Missing Authentication", "UNAUTHENTICATED");
            return getTodo({id});
        },
        todos: async (_root, { limit }, { auth, id: userId }) => {
            if (!auth) throw appError('Missing Authentication', 'UNAUTHENTICATED');
            return await getTodos({userId, limit});
        }
    },

    Mutation: {
        createTodo: async (_root, { inputTodo }, {auth, id: userId}) => {
            if (!auth) throw appError('Missing Authentication', 'UNAUTHENTICATED');
            const { description, category, dueDate, subTasks } = inputTodo;
            return createTodo({description, userId, category, dueDate, subTasks});
        },
        updateTodo: (_root, { inputTodo, id }, { auth }) => {
            if (!auth) throw appError('Missing Authentication', 'UNAUTHENTICATED');
            return updateTodo({...inputTodo, id});
        },
        deleteTodo: async (_root, { id }, { auth }) => {
            if (!auth) throw appError('Missing Authentication', 'UNAUTHENTICATED');
            return deleteTodo({id});
        }
    },

    Todo: {
        date: (todo) => {
            return toIsoDate(todo.createdAt.toISOString());
        },
    },

}
