import mongoose, { InferSchemaType } from "mongoose";

const activitySchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: [true, "Team is required"],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Author is required"],
  },
  text: {
    type: String,
    required: [true, "Please provide an activity text"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: [true, "Creation date is required"],
  },
  expiresAt: {
    type: Date,
    default: function () {
        // @ts-ignore
      const createdAt = this.createdAt;
      const expirationDate = new Date(createdAt);
      expirationDate.setMonth(createdAt.getMonth() + 3); // Add 3 months to the createdAt
      return expirationDate;
    },
  },
  eventType: {
    type: String, // e.g. "taskAdded", "taskUpdated", etc.
    required: true,
  },
  seen: {
    type: Boolean,
    default: false,
  },
});

activitySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

type ActivityType = InferSchemaType<typeof activitySchema> & { _id: string };

const Activity = mongoose.models.Activity || mongoose.model("Activity", activitySchema);

export default Activity;

export type { ActivityType };
