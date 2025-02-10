import mongoose, { InferSchemaType, Types } from "mongoose";

const chatSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide a Chat name"],
    },
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: [true, "Chat must be within a team"],
    },
    people: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, "Chat must have at least one user"],
        }
    ],
    messeges: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Messege'
        }
    ]

}, { timestamps: true })

type ChatType = InferSchemaType<typeof chatSchema> & { _id: string};

const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema);

export default Chat;

export type { ChatType };