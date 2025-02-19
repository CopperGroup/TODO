import mongoose from "mongoose";
import { InferSchemaType } from "mongoose";

const meetingSchema = new mongoose.Schema({
    description: {
        type: String,
        required: [true, "Please provide a meeting description"],
    },
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: [true, "Meeting must have a team"]
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Meeting must have a team"]
    },
    sheduledTime: {
        type: Date,
        required: [true, "Meeting must have a sheduled time"]
    },
    duration: {
        type: Number
    }
}, {timestamps: true})

type MeetingType = InferSchemaType<typeof meetingSchema> & { _id: string};

const Meeting = mongoose.models.Meeting || mongoose.model("Meeting", meetingSchema);

export default Meeting;

export type { MeetingType };