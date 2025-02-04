"use server";

import { Types } from "mongoose";
import Team, { TeamType } from "../models/team.model";
import User from "../models/user.mode";
import { connectToDB } from "../mongoose";
import { auth } from "@clerk/nextjs/server";
import Board from "../models/board.model";
import Column from "../models/column.model";
import Task from "../models/task.model";
import { PopulatedTeamType } from "../types";

type createTeamParams = {
   name: string
   usersEmails: string[],
   adminClerkId?: string
}


export async function createTeam({ name, usersEmails, adminClerkId }: createTeamParams): Promise<(TeamType & { _id: string })>;
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
        user.people.push(admin._id)
        await user.save()
    }

    admin.teams.push(createdTeam._id)

    admin.people.push(existingUsers.map(user => user._id))
    await admin.save()

    const firstBoard = await Board.create({
        name: 'Kan',
        team: createdTeam._id,
    })

    if(firstBoard) {
        const columns = [
            {
                name: "Backlog",
                textColor: "#ffffff",
                backgroundColor: "#d3d3d3", // Light gray for backlog
                board: firstBoard._id
            },
            {
                name: "To Do",
                textColor: "#ffffff",
                backgroundColor: "#f0f0f0", // Light gray background
                board: firstBoard._id
            },
            {
                name: "In Progress",
                textColor: "#ffffff",
                backgroundColor: "#ffbf00", // Yellow background
                board: firstBoard._id
            },
            {
                name: "Done",
                textColor: "#000000",
                backgroundColor: "#d3ffd3", // Light green for completed tasks
                board: firstBoard._id
            }
        ];

        const firstColumns = await Column.insertMany(columns);

        const TODOColumn = firstColumns.find(column => column.name === "To Do")

        if(TODOColumn) {
            const exampleTask = {
                description: "Meet Copper Group Kolos board",
                author: admin._id,
                column: TODOColumn._id,
                assignedTo: [admin._id],  // Assigning the task to the author for simplicity
                parentId: null,  // This is a top-level task, no parent
                subTasks: [],  // No subtasks for this example
                linkedTasks: [],  // No linked tasks for this example
                commets: [],  // Assuming no comments for this task yet
                type: "Issue"
            };

            const firstTask = await Task.create(exampleTask)

            if(firstTask) {
                TODOColumn.tasks.push(firstTask._id);
    
                await TODOColumn.save()
    
                createdTeam.tasks.push(firstTask._id)
            }

            firstBoard.columns = firstColumns;

            firstBoard.save()
        }

        createdTeam.boards.push(firstBoard._id)

        await createdTeam.save()
    }
    if(type === 'json'){
      return JSON.stringify(createdTeam)
    } else {
      return createdTeam
    }
   } catch (error: any) {
     throw new Error(`Error creating team ${error.message}`)
   }
}


export async function fetchUsersTeams(): Promise<PopulatedTeamType[]>;
export async function fetchUsersTeams(type: 'json'): Promise<string>;

export async function fetchUsersTeams(type?: 'json') {
   try {

    await connectToDB();

    const { userId } = await auth();

    if (!userId) {
      throw new Error("User is not authenticated");
    }

    // Step 2: Get the corresponding user from the database
    const user = await User.findOne({ clerkId: userId });

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