"use server";

import Comment from "../models/comment.model";
import Task from "../models/task.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import { PopulatedCommentType } from "../types";


export async function createComment({ content, clerkId, taskId, attachments }:{ content: string; clerkId: string; taskId: string; attachments?: string[] }): Promise<PopulatedCommentType>;
export async function createComment({ content, clerkId, taskId, attachments }:{ content: string; clerkId: string; taskId: string; attachments?: string[] }, type: 'json'): Promise<string>;

export async function createComment({ content, clerkId, taskId, attachments }:{ content: string; clerkId: string; taskId: string; attachments?: string[] }, type?: 'json') {
  try {
    connectToDB();

    // Check if the task exists
    const task = await Task.findById(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    // Check if the author exists
    const author = await User.findOne({ clerkId });
    if (!author) {
      throw new Error("Author not found");
    }

    const newComment = await Comment.create({
      content: content,
      author: author._id,
      task: task._id,
      attachments: attachments || [],
    });

    task.comments.push(newComment._id);

    await task.save();

    const populatedComment = await newComment.populate('author');

    if (type === 'json') {
      return JSON.stringify(populatedComment);
    } else {
      return populatedComment; 
    }

  } catch (error: any) {
    throw new Error(`${error.message}`);
  }
}
