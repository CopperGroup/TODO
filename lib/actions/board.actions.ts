"use server";

import Board from "../models/board.model";
import { connectToDB } from "../mongoose";
import { PopulatedBoardType, PopulatedTaskType } from "../types";


export async function fetchBoardById({ boardId }: { boardId: string }): Promise<PopulatedBoardType>;
export async function fetchBoardById({ boardId }: { boardId: string }, type: 'json'): Promise<string>;

export async function fetchBoardById({ boardId }: { boardId: string }, type?: 'json') {
   try {
    connectToDB();

    const board = await Board.findById(boardId)
    .populate({
      path: "columns",
    })
    .populate({
      path: "team",
      populate: {
        path: "users.user", // Populate team users
      },
    })
    .populate({
        path: 'tasks',
        populate: [
          {
            path: 'author', // Populate author field in tasks
          },
          {
            path: 'assignedTo', 
          },
          {
            path: 'subTasks', // Populate subTasks in tasks
            populate: [
              { path: 'author' }, // Populate author of each subtask
              { path: 'assignedTo' }, // Populate assignedTo in each subtask
            ]
          },
          {
            path: 'linkedTasks', // Populate author field in tasks
          },
          {
            path: 'comments', // Populate comments in tasks
            populate: { path: 'author' }, // Populate author of each comment
          }
    ]}).exec()

    if(type === 'json'){
      return JSON.stringify(board)
    } else {
      return board
    }
   } catch (error: any) {
     throw new Error(`${error.message}`)
   }
}

export async function changeTasksColumn({ boardId, tasks }: { boardId: string; tasks: PopulatedTaskType[] }) {
  try {
    await connectToDB();

    const updatedBoard = await Board.findByIdAndUpdate(
      boardId,
      { tasks: tasks.map(task => task._id) },
      { new: true }
    );

    if (!updatedBoard) {
      throw new Error("Board not found");
    }

    // return updatedBoard;
  } catch (error: any) {
    throw new Error(error.message || "Failed to update tasks");
  }
}
