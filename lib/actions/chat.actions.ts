"use server";

import { ObjectId } from "mongoose";
import Team from "../models/team.model";
import User, { UserType } from "../models/user.model";
import { TeamPopulatedChatsType } from "../types";
import plans from "@/constants/plans";

export async function fetchTeamChats({ teamId, clerkId }: { teamId: string, clerkId?: string}): Promise<TeamPopulatedChatsType>;
export async function fetchTeamChats({ teamId, clerkId }: { teamId: string, clerkId?: string}, type: 'json'): Promise<string>;

export async function fetchTeamChats({ teamId, clerkId }: { teamId: string, clerkId?: string}, type?: 'json') {
   try {

    const user = await User.findOne({ clerkId });

    if(!user) {
      throw new Error("User not found ")
    }

    const team = await Team.findById(teamId).populate({
      path: 'chats',
      populate: [
        {
          path: 'messeges',
          populate: [
                {
                    path: 'sender',
                },
                {
                    path: 'readBy',
                    select: '_id clerkId',
                    model: 'User',
                }
            ]
        },
        {
          path: 'people',
        }
      ]
    })

    const userRole = team.members.find((member: { user: ObjectId, role: 'Admin' | 'Member'}) => member.user.toString() === user._id.toString()).role

    if(!plans[team.plan as 'basic_plan' || 'pro_plan'].features.chats) {
      team.chats = team.chats.filter((chat: { people: UserType[] }) => chat.people.map(user => user.email).includes("system@kolos.com"))
    }

    if(userRole !== "Admin") {
      team.chats = team.chats.filter((chat: { people: UserType[] }) => !chat.people.map(user => user.email).includes("system@kolos.com"))
    }

    team.chats = team.chats.filter((chat: { people: UserType[] }) => chat.people.map(user => user.clerkId).includes(clerkId || ""))

    if(type === 'json'){
      return JSON.stringify(team)
    } else {
      return team
    }
   } catch (error: any) {
     throw new Error(`Error fetching team chats: ${error.message}`)
   }
}