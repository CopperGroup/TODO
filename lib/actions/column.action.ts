"use server";

import { revalidatePath } from "next/cache";
import Board from "../models/board.model";
import Column, { ColumnType } from "../models/column.model";

export async function createColumn({ name, boardId }: { name: string, boardId: string }): Promise<ColumnType>;
export async function createColumn({ name, boardId }: { name: string, boardId: string }, type: 'json'): Promise<string>;

export async function createColumn({ name, boardId }: { name: string, boardId: string }, type?: 'json') {
   try {
      
    const column = await Column.create({ 
        name: name,
        board: boardId
    })

    const board = await Board.findByIdAndUpdate(
      boardId, 
      { 
        $push: { columns: column._id }
      },
      { new: true }
    );

    revalidatePath(`/dashboard/team/${board.team}`)
    
    if(type === 'json'){
      return JSON.stringify(column)
    } else {
      return column
    }
   } catch (error: any) {
     throw new Error(`${error.message}`)
   }
}