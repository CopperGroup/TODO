import mongoose, { InferSchemaType, Types } from "mongoose";

const transactionSchema = new mongoose.Schema({
  stripeId: {
    type: String,
    required: [true, "Stripe ID is required"],
  },
  plan: {
    type: String,
    required: [true, "Plan type is required"],
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: [true, "Team ID is required"],
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Buyer ID is required"],
  },
  createdAt: {
    type: Date,
    required: [true, "Creation date is required"],
  },
});

type TransactionType = InferSchemaType<typeof transactionSchema> & {
  _id: string;
  teamId: string;
  buyerId: string;
};

const Transaction =
  mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);

export default Transaction;
export type { TransactionType };
