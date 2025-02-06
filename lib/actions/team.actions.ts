"use server";

import { Types } from "mongoose";
import Team, { TeamType } from "../models/team.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import Board from "../models/board.model";
import Column from "../models/column.model";
import Task from "../models/task.model";
import { PopulatedTeamType } from "../types";
import { revalidatePath } from "next/cache";

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

    const teamUsers = [
        ...existingUsers.map(user => ({ user: user._id, role: 'Member' })),
        { user: admin._id, role: 'Admin' }
    ];
  
    console.log(admin, teamUsers)
    const createdTeam = await Team.create({
        name: name,
        users: teamUsers,
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
        name: 'Kan',
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
            author: admin._id,
            column: TODOColumn._id,
            assignedTo: [admin._id],  // Assigning the task to the author for simplicity
            parentId: null,  // This is a top-level task, no parent
            subTasks: [],  // No subtasks for this example
            linkedTasks: [],  // No linked tasks for this example
            commets: [],  // Assuming no comments for this task yet
            team: createdTeam._id,
            type: "Issue"
        };

        const firstTask = await Task.create(exampleTask)

        if(firstTask) {
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
    const teams = await Team.find({ "users.user": user._id })
      .populate("users.user", "_id name email profilePicture role online") // Populate user details in the teams
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

export async function fetchUsersTeamsIdNameColorBoards({ clerkId }: { clerkId: string | undefined }): Promise<{ teamId: string, name: string, teamColor: string, boards: { boardId: string, name: string}[]}[]> {
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

    const teams: (TeamType & { boards: { _id: Types.ObjectId; name: string }[] })[] = await Team.find({ "users.user": user._id })
    .populate('boards', '_id name')
    .exec();
  
    return teams.map(team => ({
      teamId: team._id.toString(),
      name: team.name,
      teamColor: team.themeColor,
      boards: (team.boards as { _id: Types.ObjectId; name: string }[]).map(board => ({
        boardId: board._id.toString(),
        name: board.name
      }))
    }));
  
  } catch (error: any) {
    throw new Error(`${error.message}`)
  }
}