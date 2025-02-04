import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, "Please provide a comment content"],
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    },
    attachments: [
        {
            type: String,
        }
    ],
    responses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ]
})

const Comment = mongoose.models.Comment || mongoose.model("Comment", commentSchema);

export default Comment;