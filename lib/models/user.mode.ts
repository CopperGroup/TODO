import mongoose, { InferSchemaType } from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
  },
  clerkId: {
    type: String,
    required: [true, "Please provide a clerkId"],
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
  },
  profilePicture: {
    type: String,
  },
  online: {
    type: Boolean,
  },
  teams: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },
  ],
  people: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ]
});

type UserType = InferSchemaType<typeof userSchema>;

const User = mongoose.models.User || mongoose.model<UserType>("User", userSchema);

export default User;
export type { UserType };
