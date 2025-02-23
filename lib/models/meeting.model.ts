import mongoose from "mongoose";
import { InferSchemaType } from "mongoose";

const meetingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please provide a meeting title"],
    },
    description: {
        type: String,
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
    scheduledTime: {
        type: Date,
        required: [true, "Meeting must have a scheduled time"]
    },
    duration: {
        type: Number,
        required: [true, "Meeting must have a duration"]
    },
    invitedParticipants: 
    [   
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
}, {timestamps: true})

type MeetingType = InferSchemaType<typeof meetingSchema> & { _id: string};

const Meeting = mongoose.models.Meeting || mongoose.model("Meeting", meetingSchema);

export default Meeting;

export type { MeetingType };