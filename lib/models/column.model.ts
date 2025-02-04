import mongoose from "mongoose";

const columnSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide a column name"],
    },
    textColor: {
        type: String,
        default: "#000000"
    },
    backgroundColor: {
        type: String,
        default: "#ffffff"
    },
    board: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board'
    },
    tasks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task'
        }
    ],
})

const Column = mongoose.models.Column || mongoose.model("Column", columnSchema);

export default Column;