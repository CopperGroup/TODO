"use server";

import Chat from "../models/chat.model";
import Messege, { MessegeType } from "../models/messege";
import User, { UserType } from "../models/user.model";
import { connectToDB } from "../mongoose";

export async function handleMessegesRead({ messegesIds, clerkId }: { messegesIds: string[], clerkId: string }) {
  try {
    connectToDB();

    const user = await User.findOne({ clerkId });

    if(!user) {
        throw new Error("User not found ")
    }

    await Messege.updateMany(
        { _id: { $in: messegesIds }, readBy: { $ne: user._id } },
        { $addToSet: { readBy: user._id } }
      );
      

  } catch (error: any) {
    throw new Error(`Error adding read messeges: ${error.message}`)
  }
}

export async function createMessege({ sender, content, messegeType, chat }: { sender: string, content: string, messegeType: string, chat: string }): Promise<MessegeType & { sender: UserType, readBy: { _id: string, clerkId: string }[]}>;
export async function createMessege({ sender, content, messegeType, chat }: { sender: string, content: string, messegeType: string, chat: string }, type: 'json'): Promise<string>;

export async function createMessege({ sender, content, messegeType, chat }: { sender: string, content: string, messegeType: string, chat: string }, type?: 'json') {
   try {

    const messege = await Messege.create({
      sender,
      content,
      type: messegeType,
      chat,
      readBy: [sender],
    });

    await Chat.findByIdAndUpdate(chat, { $push: { messeges: messege._id } });

    const populatedMessege = await Messege.findById(messege._id).populate(
      [
        {
            path: 'sender',
        },
        {
            path: 'readBy',
            select: '_id clerkId',
            model: 'User',
        }
      ]
    )
    if(type === 'json'){
      return JSON.stringify(populatedMessege)
    } else {
      return populatedMessege
    }
   } catch (error: any) {
     throw new Error(`${error.message}`)
   }
}