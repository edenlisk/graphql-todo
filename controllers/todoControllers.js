import TodoModel from "../models/todo.model.js";
import {appError} from "../utils/helperFunctions.js";


export async function createTodo ({ description, userId, category, dueDate, subTasks }){
    const createdTodo = await TodoModel.create(
        {
            userId,
            description,
            category,
            subTasks,
            dueDate
        }
    )

    return {
        id: createdTodo._id,
        ...createdTodo._doc
    };
}

export async function updateTodo ({ category, isCompleted, description, dueDate, subTask, id }){
    const todo = await TodoModel.findById(id);
    if (!todo) throw appError("No todo with " + id, "BAD_INPUT");
    // await TodoModel.updateOne({_id: id}, {$set: {category, isCompleted}, $push: { subTasks: subTask }})
    if (description) todo.description = description;
    if (isCompleted) todo.isCompleted = isCompleted;
    if (category) todo.category = category;
    if (subTask) todo.subTasks.push(subTask);
    if (dueDate) todo.dueDate = dueDate;
    await todo.save({validateModifiedOnly: true});
    return {
        id: todo._id,
        ...todo._doc
    };
}

export async function deleteTodo ({id}) {
    const deleteResult = await TodoModel.findByIdAndDelete(id);
    return !!deleteResult;
}

export async function getTodo ({id}) {
    const todo = await TodoModel.findById(id);
    if (!todo) throw appError(`Unable to find todo with ${id}`, "BAD_INPUT");
    return todo;
}

export async function getTodos ({ userId, limit }) {
    return TodoModel.find({userId}).sort('-createAt').limit(limit);
}