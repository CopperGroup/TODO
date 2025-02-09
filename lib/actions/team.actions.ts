"use server";

import { Types } from "mongoose";
import Team, { TeamType } from "../models/team.model";
import User, { UserType } from "../models/user.model";
import { connectToDB } from "../mongoose";
import Board from "../models/board.model";
import Column from "../models/column.model";
import Task from "../models/task.model";
import { PopulatedTeamType } from "../types";
import { revalidatePath } from "next/cache";
import Comment from "../models/comment.model";

type createTeamParams = {
   name: string
   usersEmails: string[],
   adminClerkId?: string
}


export async function createTeam({ name, usersEmails, adminClerkId }: createTeamParams): Promise<(TeamType)>;
export async function createTeam({ name, usersEmails, adminClerkId }: createTeamParams, type: 'json'): Promise<string>;

export async function createTeam({ name, usersEmails, adminClerkId }: createTeamParams, type?: 'json') {
   try {
    await connectToDB();

    const existingUsers = await User.find({ email: { $in: usersEmails }})

    if(!adminClerkId) {
        throw new Error(`Error creating team, no admin clerk id`)
    } 

    const admin = await User.findOne({ clerkId: adminClerkId })

    if(!admin) {
        throw new Error(`Error creating team, no admin user found`)
    } 

    const teamMembers = [
        ...existingUsers.map(user => ({ user: user._id, role: 'Member' })),
        { user: admin._id, role: 'Admin' }
    ];

    const createdTeam = await Team.create({
        name: name,
        members: teamMembers,
        invitedMembers: usersEmails
    })
    
    for(const user of existingUsers) {
        user.teams.push(createdTeam._id)
        // user.people.push(admin._id)
        await user.save()
    }

    admin.teams.push(createdTeam._id)

    // admin.people.push(existingUsers.map(user => user._id))
    await admin.save()

    const firstBoard = await Board.create({
        name: 'Kolos 1',
        team: createdTeam._id,
    })

    if(firstBoard) {
        const columns = [
            {
                name: "Backlog",
                textColor: "#737373",
                board: firstBoard._id
            },
            {
                name: "TODO",
                textColor: "#fef08a",
                board: firstBoard._id
            },
            {
                name: "In Progress",
                textColor: "#bfdbfe",
                board: firstBoard._id
            },
            {
                name: "Done",
                textColor: "#a7f3d0",
                board: firstBoard._id
            }
        ];

        const firstColumns = await Column.insertMany(columns);

        const TODOColumn = firstColumns.find(column => column.name === "TODO")

        const exampleTask = {
            description: "Meet Copper Group Kolos board",
            board: firstBoard._id,
            author: admin._id,
            column: TODOColumn._id,
            assignedTo: [admin._id],
            parentId: null,
            subTasks: [],
            linkedTasks: [], 
            commets: [],
            team: createdTeam._id,
            type: "Issue",
            location: 'Board'
        };

        const firstTask = await Task.create(exampleTask)

        if(firstTask) {
          const firstComment = await Comment.create({
            content: "Move to DONE, when finished😉",
            author: admin._id,
            task: firstTask._id,
          })

          firstTask.comments.push(firstComment._id)

          await firstTask.save();

          firstBoard.tasks.push(firstTask._id)
          createdTeam.tasks.push(firstTask._id)
        }

        firstBoard.columns = firstColumns;

        firstBoard.save()

        createdTeam.boards.push(firstBoard._id)

        await createdTeam.save()
    }

    revalidatePath("/dashboard")
    if(type === 'json'){
      return JSON.stringify(createdTeam)
    } else {
      return createdTeam
    }
   } catch (error: any) {
     throw new Error(`Error creating team ${error.message}`)
   }
}


export async function fetchUsersTeams({ clerkId }: { clerkId: string | undefined }): Promise<PopulatedTeamType[]>;
export async function fetchUsersTeams({ clerkId }: { clerkId: string | undefined }, type: 'json'): Promise<string>;

export async function fetchUsersTeams({ clerkId }: { clerkId: string | undefined }, type?: 'json') {
   try {

    await connectToDB();

    if (!clerkId) {
      throw new Error("User is not authenticated");
    }

    // Step 2: Get the corresponding user from the database
    const user = await User.findOne({ clerkId });

    if (!user) {
      throw new Error("User not found in database");
    }

    // Step 3: Find teams that the user is part of (using user._id)
    const teams = await Team.find({ "members.user": user._id })
      .populate("members.user", "_id name email profilePicture role online") // Populate user details in the teams
      .populate("boards", "_id name")
      .populate("tasks")
      .exec();

    if(type === 'json'){
      return JSON.stringify(teams)
    } else {
      return teams
    }
   } catch (error: any) {
     throw new Error(`${error.message}`)
   }
}
export async function fetchUsersTeamsIdNameColorBoards(
  { clerkId }: { clerkId: string | undefined }
): Promise<{
  user: UserType;
  teams: {
    teamId: string;
    name: string;
    teamColor: string;
    boards: { boardId: string; name: string }[];
    members: { user: string; role: 'Admin' | 'Member' }[];
  }[];
}> {
  try {
    await connectToDB();

    if (!clerkId) {
      throw new Error("User is not authenticated");
    }

    const user = await User.findOne({ clerkId });

    if (!user) {
      throw new Error("User not found in database");
    }

    const teams = await Team.find({ "members.user": user._id })
      .populate('boards', '_id name')
      .exec();

    return {
      user,
      teams: teams.map((team) => ({
        teamId: team._id.toString(),
        name: team.name,
        teamColor: team.themeColor,
        boards: team.boards.map((board: { _id: string; name: string }) => ({
          boardId: board._id.toString(),
          name: board.name,
        })),
        members: team.members.map((member: { user: string, role: "Admin" | "Member" }) => ({
          user: member.user,
          role: member.role as 'Admin' | 'Member',
        })),
      })),
    };
  } catch (error: any) {
    throw new Error(`Error fetching sidebar info: ${error.message}`);
  }
}
