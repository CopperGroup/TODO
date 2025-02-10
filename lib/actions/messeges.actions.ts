"use server";

import Messege from "../models/messege";
import User from "../models/user.model";
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