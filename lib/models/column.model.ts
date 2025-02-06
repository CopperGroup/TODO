import mongoose, { InferSchemaType, Types } from "mongoose";

const columnSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide a column name"],
    },
    textColor: {
        type: String,
        default: "#ffffff"
    },
    // backgroundColor: {
    //     type: String,
    //     default: "#000000"
    // },
    board: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board'
    },
})

type ColumnType = InferSchemaType<typeof columnSchema> & { _id: string};

const Column = mongoose.models.Column || mongoose.model("Column", columnSchema);

export default Column;

export type { ColumnType };