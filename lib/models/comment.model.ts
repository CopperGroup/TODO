import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, "Please provide a comment content"],
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Comment must have an author"],
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: [true, "COmment must have a task"],
    },
    attachments: [
        {
            type: String,
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
        required: [true, "Creation date is required"],
    }
})

const Comment = mongoose.models.Comment || mongoose.model("Comment", commentSchema);

export default Comment;