"use server";

import Board from "../models/board.model";
import Column from "../models/column.model";
import Task from "../models/task.model";
import Team from "../models/team.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

export async function updateTaskColumn({ taskId, columnId }: { taskId: string, columnId: string }) {
    try {
      connectToDB();
  
      await Task.findByIdAndUpdate(
          taskId,
          { column: columnId },
          { new: true }
      )
    
  } catch (error: any) {
    throw new Error(`${error.message}`)
  }
}

type Params = {
   name: string
}

type ReturnType = {
   name: string
}

export async function createNewTask({ clerkId, teamId, boardId, columnId, decription, taskType }: { clerkId: string | undefined, teamId: string, boardId: string, columnId: string, decription: string, taskType: string }): Promise<ReturnType>;
export async function createNewTask({ clerkId, teamId, boardId, columnId, decription, taskType }: { clerkId: string | undefined, teamId: string, boardId: string, columnId: string, decription: string, taskType: string }, type: 'json'): Promise<string>;

export async function createNewTask({ clerkId, teamId, boardId, columnId, decription, taskType }: { clerkId: string | undefined, teamId: string, boardId: string, columnId: string, decription: string, taskType: string }, type?: 'json') {
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
          team: teamId
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