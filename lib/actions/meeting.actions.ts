"use server";

import mongoose from "mongoose";
import Meeting, { MeetingType } from "../models/meeting.model";
import Team from "../models/team.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import { TeamMeetingsType } from "../types";

export async function createMeeting({ title, description, teamId, clerkId, scheduledTime, duration, invitedParticipants }: { title: string, description: string | undefined, teamId: string, clerkId: string, scheduledTime: Date, duration: number, invitedParticipants?: string[]}): Promise<TeamMeetingsType["meetings"][number]>;
  
export async function createMeeting({ title, description, teamId, clerkId, scheduledTime, duration, invitedParticipants }: { title: string, description: string | undefined, teamId: string, clerkId: string, scheduledTime: Date, duration: number, invitedParticipants?: string[]}, type: "json" ): Promise<string>;

export async function createMeeting( { title, description, teamId, clerkId, scheduledTime, duration, invitedParticipants }: { title: string, description: string | undefined, teamId: string, clerkId: string, scheduledTime: Date, duration: number, invitedParticipants?: string[]}, type?: "json") {
  connectToDB();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findOne({ clerkId }).session(session);
    if (!user) throw new Error("User not found");

    const team = await Team.findById(teamId).session(session);
    if (!team) throw new Error("Team not found");

    console.log(scheduledTime)
    const newMeeting = await Meeting.create(
      [
        {
          title,
          description,
          team: team._id,
          author: user._id,
          scheduledTime,
          duration,
          invitedParticipants: invitedParticipants || [],
        },
      ],
      { session }
    );

    team.meetings.push(newMeeting[0]._id);
    await team.save({ session });

    const meeting = await Meeting.findById(newMeeting[0]._id)
    .populate([
      {
        path: "author",
        model: User
      },
      {
        path: "invitedParticipants",
        model: User
      }
    ])

    .session(session);
    await session.commitTransaction();
    session.endSession();

    return type === "json" ? JSON.stringify(meeting) : meeting;
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw new Error(`Error creating new meeting: ${error.message}`);
  }
}

export async function fetchTeamMeetings({ teamId }: { teamId: string }): Promise<TeamMeetingsType>;
export async function fetchTeamMeetings({ teamId }: { teamId: string }, type: 'json'): Promise<string>;

export async function fetchTeamMeetings({ teamId }: { teamId: string }, type?: 'json') {
   try {
    connectToDB();

    const team = await Team.findById(teamId).populate([
      {
        path: 'meetings',
        populate: [
          {
            path: 'author',
            model: User
          },
          {
            path: 'invitedParticipants',
            model: User
          }
        ],
        model: Meeting
      },
      {
        path: 'members.user',
        model: User
      }
    ])

    if(type === 'json'){
      return JSON.stringify(team)
    } else {
      return team
    }
   } catch (error: any) {
     throw new Error(`Error fetching team meetings: ${error.message}`)
   }
}