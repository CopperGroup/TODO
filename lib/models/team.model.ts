import mongoose, { InferSchemaType, Types } from "mongoose";

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a team name"],
  },
  members: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "There must be at least one member"],
      },
      role: {
        type: String,
        enum: ["Admin", "Member"],
        required: [true, "Please provide a role (Admin or Member)"],
      },
    },
  ],
  boards: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
    },
  ],
  invitedMembers: [
    {
      type: String,
    },
  ],
  requests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  themeColor: {
    type: String,
    default: "#3b82f6",
  },
  tasks: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }
  ],
  chats: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat'
    },
  ],
  plan: {
    type: String,
    required: [true, "Team must have a billing plan"]
  }
});

type TeamType = InferSchemaType<typeof teamSchema> & { 
  _id: string,
  boards?: string[],
  tasks?: string[],
  members: {
    user: string;
    role: "Admin" | "Member"
  },
  requests?: string[],
};

const Team = mongoose.models.Team || mongoose.model<TeamType>("Team", teamSchema);

export default Team;
export type { TeamType };
