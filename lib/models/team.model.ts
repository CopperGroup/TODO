import mongoose, { InferSchemaType, Types } from "mongoose";

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a team name"],
  },
  users: [
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
  themeColor: {
    type: String,
    default: "#3b82f6",
  },
  tasks: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }
  ]
});

type TeamType = InferSchemaType<typeof teamSchema> & { _id: Types.ObjectId};

const Team = mongoose.models.Team || mongoose.model<TeamType>("Team", teamSchema);

export default Team;
export type { TeamType };
