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
    required: [true, "Please provide an profile picture"],
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
  requests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team"
    }
  ],
  people: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  transactions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
    }
  ]
});

userSchema.index({ clerkId: 1 });

type UserType = InferSchemaType<typeof userSchema> & { 
  _id: string,
  teams: string[]
};

const User = mongoose.models.User || mongoose.model<UserType>("User", userSchema);

export default User;
export type { UserType };
