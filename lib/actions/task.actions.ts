"use server";

import mongoose from "mongoose";
import Board from "../models/board.model";
import Column from "../models/column.model";
import Comment from "../models/comment.model";
import Task, { TaskType } from "../models/task.model";
import Team from "../models/team.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import { PopulatedTaskType } from "../types";
import { revalidatePath } from "next/cache";

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
    throw new Error(`Erorr updating tasks column ${error.message}`)
  }
}

export async function createNewTask({ clerkId, teamId, boardId, columnId, description, taskType, location }: { clerkId: string | undefined, teamId: string, boardId: string, columnId: string, description: string, taskType: string, location?: "Board" | "Backlog" }): Promise<TaskType>;
export async function createNewTask({ clerkId, teamId, boardId, columnId, description, taskType, location }: { clerkId: string | undefined, teamId: string, boardId: string, columnId: string, description: string, taskType: string, location?: "Board" | "Backlog" }, type: 'json'): Promise<string>;

export async function createNewTask({ clerkId, teamId, boardId, columnId, description, taskType, location = "Board" }: { clerkId: string | undefined, teamId: string, boardId: string, columnId: string, description: string, taskType: string, location?: "Board" | "Backlog" }, type?: 'json') {
    try {
        connectToDB()

        const author = await User.findOne({ clerkId });

        if(!author) {
            throw new Error("No author found")
        }

        const task = await Task.create({
          description: description,
          author: author._id,
          column: columnId,
          type: taskType,
          team: teamId,
          board: boardId,
          location
        });
    
        // Push task ID to the related board
        await Board.findByIdAndUpdate(boardId, { $push: { tasks: task._id } });
    
        // Push task ID to the related team
        await Team.findByIdAndUpdate(teamId, { $push: { tasks: task._id } });
    
        const populatedTask = await Task.findById(task._id)
            .populate([
                { path: 'author' },
                { path: 'assignedTo' },
                {
                path: 'subTasks',
                populate: [
                    { path: 'author' },
                    { path: 'assignedTo' },
                ],
                },
                { path: 'linkedTasks' },
                {
                path: 'comments',
                options: { sort: { createdAt: -1 } },
                populate: { path: 'author' },
                },
            ])
            .exec();
        
        revalidatePath(`/dashboard/team/${teamId}`)
        if (type === "json") {
          return JSON.stringify(populatedTask);
        } else {
          return populatedTask;
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


export async function updateTaskDescription({ taskId, prevDescription, newDescription }: { taskId: string, prevDescription: string, newDescription: string }): Promise<PopulatedTaskType>;
export async function updateTaskDescription({ taskId, prevDescription, newDescription }: { taskId: string, prevDescription: string, newDescription: string }, type: 'json'): Promise<string>;

export async function updateTaskDescription({ taskId, prevDescription, newDescription }: { taskId: string, prevDescription: string, newDescription: string }, type?: 'json') {
   try {
      
    connectToDB();

    const task = await Task.findByIdAndUpdate(
        taskId, 
        { description: newDescription }, 
        { new: true }
    ).populate([
        { path: 'author' },
        { path: 'assignedTo' },
        {
          path: 'subTasks',
          populate: [
            { path: 'author' },
            { path: 'assignedTo' },
          ],
        },
        { path: 'linkedTasks' },
        {
          path: 'comments',
          options: { sort: { createdAt: -1 } },
          populate: { path: 'author' },
        },
      ]).exec()
      
    if(type === 'json'){
      return JSON.stringify(task)
    } else {
      return task
    }
   } catch (error: any) {
     throw new Error(`Eror updating task description ${error.message}`)
   }
}

export async function createNewTaskSubtask({ parentId, clerkId, teamId, boardId, columnId, description, taskType, assigneesIds, location }: { parentId: string, clerkId: string | undefined, teamId: string, boardId: string, columnId: string, description: string, taskType: string, assigneesIds?: string[], location?: "Board" | "Backlog" }): Promise<TaskType>;
export async function createNewTaskSubtask({ parentId, clerkId, teamId, boardId, columnId, description, taskType, assigneesIds, location }: { parentId: string, clerkId: string | undefined, teamId: string, boardId: string, columnId: string, description: string, taskType: string, assigneesIds?: string[], location?: "Board" | "Backlog" }, type: 'json'): Promise<string>;

export async function createNewTaskSubtask({ parentId, clerkId, teamId, boardId, columnId, description, taskType, assigneesIds, location = "Board" }: { parentId: string, clerkId: string | undefined, teamId: string, boardId: string, columnId: string, description: string, taskType: string, assigneesIds?: string[], location?: "Board" | "Backlog" }, type?: 'json') {
    try {
        connectToDB()

        const author = await User.findOne({ clerkId });

        if(!author) {
            throw new Error("No author found")
        }

        const parentTask = await Task.findById(parentId);

        if(parentTask.parentId) {
            throw new Error('Creating subtask on a subtask is not yet available')
        }

        const task = await Task.create({
          description: description,
          author: author._id,
          column: columnId,
          type: taskType,
          team: teamId,
          board: boardId,
          parentId: parentId,
          assignedTo: assigneesIds || [],
          location
        });
    

        parentTask.subTasks.push(task._id);
        await parentTask.save();

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

export async function assignTask({ assigneesIds, taskId }: { assigneesIds: string[], taskId: string }): Promise<PopulatedTaskType>;
export async function assignTask({ assigneesIds, taskId }: { assigneesIds: string[], taskId: string }, type: 'json'): Promise<string>;

export async function assignTask({ assigneesIds, taskId }: { assigneesIds: string[], taskId: string }, type?: 'json') {
   try {
    connectToDB()

    const users = await User.find({ _id: { $in: assigneesIds } }).exec();

    if (users.length !== assigneesIds.length) {
      throw new Error("One or more users do not exist.");
    }

    const task = await Task.findByIdAndUpdate(
        taskId, 
        {
            assignedTo: assigneesIds
        },
        { new: true }
    ).populate([
        { path: 'author' },
        { path: 'assignedTo' },
        {
          path: 'subTasks',
          populate: [
            { path: 'author' },
            { path: 'assignedTo' },
          ],
        },
        { path: 'linkedTasks' },
        {
          path: 'comments',
          options: { sort: { createdAt: -1 } },
          populate: { path: 'author' },
        },
      ]).exec();


    if(type === 'json'){
      return JSON.stringify(task)
    } else {
      return task
    }
   } catch (error: any) {
     throw new Error(`Error assigning users to taskv${error.message}`)
   }
}

export async function updateTaskLabels({ taskId, labels }: { taskId: string, labels: string[] }): Promise<PopulatedTaskType>;
export async function updateTaskLabels({ taskId, labels }: { taskId: string, labels: string[] }, type: 'json'): Promise<string>;

export async function updateTaskLabels({ taskId, labels }: { taskId: string, labels: string[] }, type?: 'json') {
   try {
    connectToDB();

    const task = await Task.findByIdAndUpdate(
        taskId,
        {
            labels
        },
        { new: true }
    ).populate([
        { path: 'author' },
        { path: 'assignedTo' },
        {
          path: 'subTasks',
          populate: [
            { path: 'author' },
            { path: 'assignedTo' },
          ],
        },
        { path: 'linkedTasks' },
        {
          path: 'comments',
          options: { sort: { createdAt: -1 } },
          populate: { path: 'author' },
        },
      ]).exec()
    
    if(type === 'json'){
      return JSON.stringify(task)
    } else {
      return task
    }
   } catch (error: any) {
     throw new Error(`${error.message}`)
   }
}

export async function addAttachmentsToTask({ taskId, attachmentsLinks }: { taskId: string, attachmentsLinks: string[] }): Promise<PopulatedTaskType>;
export async function addAttachmentsToTask({ taskId, attachmentsLinks }: { taskId: string, attachmentsLinks: string[] }, type: 'json'): Promise<string>;

export async function addAttachmentsToTask({ taskId, attachmentsLinks }: { taskId: string, attachmentsLinks: string[] }, type?: 'json') {
   try {
    connectToDB();

    const task = await Task.findByIdAndUpdate(
        taskId,
        {
            $push: { attachments: attachmentsLinks } 
        },
        { new: true }
    ).populate([
        { path: 'author' },
        { path: 'assignedTo' },
        {
          path: 'subTasks',
          populate: [
            { path: 'author' },
            { path: 'assignedTo' },
          ],
        },
        { path: 'linkedTasks' },
        {
          path: 'comments',
          options: { sort: { createdAt: -1 } },
          populate: { path: 'author' },
        },
      ]).exec()

    if(type === 'json'){
      return JSON.stringify(task)
    } else {
      return task
    }
   } catch (error: any) {
     throw new Error(`${error.message}`)
   }
}

export async function removeAttachmentsFromTask({ taskId, attachmentLinks }: { taskId: string, attachmentLinks: string[] }): Promise<PopulatedTaskType>;
export async function removeAttachmentsFromTask({ taskId, attachmentLinks }: { taskId: string, attachmentLinks: string[] }, type: 'json'): Promise<string>;

export async function removeAttachmentsFromTask({ taskId, attachmentLinks }: { taskId: string, attachmentLinks: string[] }, type?: 'json') {
  try {
    await connectToDB();

    const task = await Task.findByIdAndUpdate(
      taskId,
      {
        $pullAll: { attachments: attachmentLinks },
      },
      { new: true }
    ).populate([
      { path: 'author' },
      { path: 'assignedTo' },
      {
        path: 'subTasks',
        populate: [
          { path: 'author' },
          { path: 'assignedTo' },
        ],
      },
      { path: 'linkedTasks' },
      {
        path: 'comments',
        options: { sort: { createdAt: -1 } },
        populate: { path: 'author' },
      },
    ]).exec();

    if (type === 'json') {
      return JSON.stringify(task);
    } else {
      return task;
    }
  } catch (error: any) {
    throw new Error(`Error removing attachments: ${error.message}`);
  }
}

export async function linkTasks({ taskId, linkedTasksIds, operation }: { taskId: string, linkedTasksIds: string[], operation: "Push" | "Pull"}): Promise<PopulatedTaskType>;
export async function linkTasks({ taskId, linkedTasksIds, operation }: { taskId: string, linkedTasksIds: string[], operation: "Push" | "Pull"}, type: 'json'): Promise<string>;

export async function linkTasks({ taskId, linkedTasksIds, operation }: { taskId: string, linkedTasksIds: string[], operation: "Push" | "Pull"}, type?: 'json') {
   try {
    connectToDB()

    const updateOperation = operation === "Push" ? { $addToSet: { linkedTasks: { $each: linkedTasksIds } } } : { $pull: { linkedTasks: { $in: linkedTasksIds } } };
    const reverseUpdateOperation = operation === "Push" ? { $addToSet: { tasksLinkedToThis: taskId } } : { $pull: { tasksLinkedToThis: taskId } };

    // Update the main task's linkedTasks field
    const mainTask = await Task.findByIdAndUpdate(
      taskId,
      updateOperation,
      { new: true }
    ).populate([
      { path: "author" },
      { path: "assignedTo" },
      {
        path: "subTasks",
        populate: [
          { path: "author" },
          { path: "assignedTo" },
        ],
      },
      { path: "linkedTasks" },
      {
        path: "comments",
        options: { sort: { createdAt: -1 } },
        populate: { path: "author" },
      },
    ]).exec();

    if (!mainTask) {
      throw new Error("Task not found");
    }

    // Update the linked tasks to either push or pull the taskId in their tasksLinkedToThis
    await Task.updateMany(
      { _id: { $in: linkedTasksIds } },
      reverseUpdateOperation
    );

      
    if(type === 'json'){
      return JSON.stringify(mainTask)
    } else {
      return mainTask
    }
   } catch (error: any) {
     throw new Error(`${error.message}`)
   }
}