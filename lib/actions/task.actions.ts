"use server";

import mongoose from "mongoose";
import Board from "../models/board.model";
import Column from "../models/column.model";
import Comment from "../models/comment.model";
import Task, { TaskType } from "../models/task.model";
import Team from "../models/team.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

export async function updateTaskColumn({ taskId, columnId }: { taskId: string, columnId: string }) {
    try {
      connectToDB();
  
      await Task.findByIdAndUpdate(
          taskId,
          { 
            column: columnId,
            updatedAt: Date.now()
          },
          { new: true }
      )
    
  } catch (error: any) {
    throw new Error(`${error.message}`)
  }
}

export async function createNewTask({ clerkId, teamId, boardId, columnId, decription, taskType, location }: { clerkId: string | undefined, teamId: string, boardId: string, columnId: string, decription: string, taskType: string, location?: "Board" | "Backlog" }): Promise<TaskType>;
export async function createNewTask({ clerkId, teamId, boardId, columnId, decription, taskType, location }: { clerkId: string | undefined, teamId: string, boardId: string, columnId: string, decription: string, taskType: string, location?: "Board" | "Backlog" }, type: 'json'): Promise<string>;

export async function createNewTask({ clerkId, teamId, boardId, columnId, decription, taskType, location = "Board" }: { clerkId: string | undefined, teamId: string, boardId: string, columnId: string, decription: string, taskType: string, location?: "Board" | "Backlog" }, type?: 'json') {
    try {
        connectToDB()

        const author = await User.findOne({ clerkId });

        if(!author) {
            throw new Error("No author found")
        }

        const task = await Task.create({
          description: decription,
          author: author._id,
          column: columnId,
          type: taskType,
          team: teamId,
          board: boardId,
          location
        });
    
        // Push task ID to the related column
        await Column.findByIdAndUpdate(columnId, { $push: { tasks: task._id } });
    
        // Push task ID to the related board
        await Board.findByIdAndUpdate(boardId, { $push: { tasks: task._id } });
    
        // Push task ID to the related team
        await Team.findByIdAndUpdate(teamId, { $push: { tasks: task._id } });
    
        if (type === "json") {
          return JSON.stringify(task);
        } else {
          return task;
        }
   } catch (error: any) {
     throw new Error(`Failed to create task ${error.message}`)
   }
}

type DeleteTaskArgs = {
  taskId: string;
  teamId: string;
  boardId: string;
  commentIds: string[];
  subTasksIds: string[];
  tasksLinkedToThisIds: string[];
}[];

export async function deleteTasks(tasks: DeleteTaskArgs) {
  const session = await mongoose.startSession();

  try {
    // Start a transaction
    session.startTransaction();

    // Step 1: Connect to the database
    await connectToDB();

    for (const task of tasks) {
      const { taskId, teamId, boardId, commentIds, subTasksIds, tasksLinkedToThisIds } = task;

      // Step 2: Delete related comments within the transaction
      await Comment.deleteMany({ _id: { $in: commentIds } }).session(session);

      // Step 3: Remove task from its board, team, and column
      await Board.updateOne({ _id: boardId }, { $pull: { tasks: taskId } }).session(session);
      await Team.updateOne({ _id: teamId }, { $pull: { tasks: taskId } }).session(session);

      // Step 4: Handle subtasks and linked tasks
      await Task.deleteMany({ _id: { $in: subTasksIds } }).session(session); // Delete all subtasks
      await Task.updateMany(
        { _id: { $in: tasksLinkedToThisIds } },
        { $pull: { linkedTasks: taskId } }
      ).session(session);

      // Step 5: Delete the main task
      await Task.deleteOne({ _id: taskId }).session(session);

      console.log(`Task ${taskId} and related data have been deleted.`);
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
  } catch (error: any) {
    // If an error occurs, abort the transaction
    await session.abortTransaction();
    session.endSession();
    throw new Error(`Failed to delete tasks: ${error.message}`);
  }
}
