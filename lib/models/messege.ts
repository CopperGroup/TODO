import mongoose, { InferSchemaType, Types } from "mongoose";

const messegeSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, "Please provide a Messege conetnt"],
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Messege must have a sender"],
    },
    type: {
        type: String,
        required: [true, "Messegemust have a type"]
    },
    readBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    chat: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chat',
            required: [true, 'Messege must belong to chat']
        }
    ]

}, { timestamps: true })

type MessegeType = InferSchemaType<typeof messegeSchema> & { 
    _id: string,
    sender: string | 'System'
};

const Messege = mongoose.models.Messege || mongoose.model("Messege", messegeSchema);

export default Messege;

export type { MessegeType };