"use server";

import { revalidatePath } from "next/cache";
import Board, { BoardType } from "../models/board.model";
import Column from "../models/column.model";
import Team from "../models/team.model";
import { connectToDB } from "../mongoose";
import { PopulatedBoardType, PopulatedTaskType } from "../types";


export async function fetchBoardById({ boardId }: { boardId: string }): Promise<PopulatedBoardType>;
export async function fetchBoardById({ boardId }: { boardId: string }, type: 'json'): Promise<string>;

export async function fetchBoardById({ boardId }: { boardId: string }, type?: 'json') {
   try {
    connectToDB();

    let board = await Board.findById(boardId)
    .populate({
      path: "columns",
    })
    .populate({
      path: "team",
      populate: {
        path: "members.user", // Populate team users
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
            options: { sort: { createdAt: -1 } }
          },
    ]}).exec()

    board.tasks = board.tasks.filter((task: any) => !task.parentId);

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

export async function changeBoardColumnsOrder({ boardId, columnsIds }: { boardId: string, columnsIds: string[] }) {
  try {
    connectToDB();

    await Board.findByIdAndUpdate(
        boardId,
        {
            columns: columnsIds
        }
    )
  } catch (error: any) {
    throw new Error(`Erorr changing board's coulmns order: ${error.message}`)
  }
}


export async function createBoard({ teamId, boardName }: { teamId: string, boardName: string }): Promise<BoardType>;
export async function createBoard({ teamId, boardName }: { teamId: string, boardName: string }, type: 'json'): Promise<string>;

export async function createBoard({ teamId, boardName }: { teamId: string, boardName: string }, type?: 'json') {
   try {
    connectToDB();

    const team = await Team.findById(teamId);

    if(!team) {
        throw new Error("Team hasn't been found")
    }

    const board = await Board.create({
        name: boardName,
        team: teamId
    })

    if(board) {
        const columns = [
            {
                name: "Backlog",
                textColor: "#737373",
                board: board._id
            },
            {
                name: "TODO",
                textColor: "#fef08a",
                board: board._id
            },
            {
                name: "In Progress",
                textColor: "#bfdbfe",
                board: board._id
            },
            {
                name: "Done",
                textColor: "#a7f3d0",
                board: board._id
            }
        ];

        const firstColumns = await Column.insertMany(columns);

        board.columns = firstColumns.map(col => col._id);

        await board.save();

        team.boards.push(board._id);

        await team.save()
    }
    
    revalidatePath(`/dashboard/team/${teamId}`)
    if(type === 'json'){
      return JSON.stringify(board)
    } else {
      return board
    }
   } catch (error: any) {
     throw new Error(`${error.message}`)
   }
}