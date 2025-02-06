"use server";

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

    await Board.findByIdAndUpdate(boardId, { 
        $push: { columns: column._id }
    });

    if(type === 'json'){
      return JSON.stringify(column)
    } else {
      return column
    }
   } catch (error: any) {
     throw new Error(`${error.message}`)
   }
}