import mongoose, { InferSchemaType } from "mongoose";

const taskSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, "Please provide a task description"],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Author is required"],
  },
  column: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Column",
    required: [true, "Column is required"],
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Board",
  },
  assignedTo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
  },
  subTasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
  ],
  linkedTasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
  ],
  tasksLinkedToThis: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
    required: [true, "Creation date is required"],
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    required: [true, "Creation date is required"],
  },
  attachments: [
    {
      type: String,
    },
  ],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  type: {
    type: String,
    required: [true, "Task type is required"],
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: [true, "Team is required"],
  },
  location: {
    type: String,
    enum: ["Board", "Backlog"],
    required: [true, "Task location ('Board' | 'Backlog') is required"],
  }
});

type TaskType = InferSchemaType<typeof taskSchema> & { 
    _id: string, 
    boardId: string,
    column: string, 
    team: string, 
    author: string, 
    parentId: string, 
    comment: string[], 
    linkedTasks: string[], 
    tasksLinkedToThis: string[]
    assignedTo: string[] 
};

const Task = mongoose.models.Task || mongoose.model<TaskType>("Task", taskSchema);

export default Task;
export type { TaskType };
