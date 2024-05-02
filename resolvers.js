import TodoModel from "./models/todo.model.js";
import CommentsModel from "./models/comments.model.js";
import UserModel from "./models/user.model.js";
import {config} from "dotenv";

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

function toIsoDate(date) {
    return date.slice(0, 'yyyy-mm-dd'.length);
}