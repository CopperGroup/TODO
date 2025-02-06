import mongoose from "mongoose";

const boardSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide a board name"],
    },
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
    },
    columns: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Column'
        }
    ],
    tasks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task'
        }
    ]
})

const Board = mongoose.models.Board || mongoose.model("Board", boardSchema);

export default Board;