import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: [true, "Please provide a task description"],
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    column: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Column'
    },
    assignedTo: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    },
    subTasks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task'
        }
    ],
    linkedTasks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task'
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    attachments: [
        {
            type: String
        }
    ],
    commets: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ],
    type: {
        type: String
    }
})

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);

export default Task;