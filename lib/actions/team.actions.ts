"use server";

import Team, { TeamType } from "../models/team.model";
import User, { UserType } from "../models/user.model";
import { connectToDB } from "../mongoose";
import Board from "../models/board.model";
import Column from "../models/column.model";
import Task from "../models/task.model";
import { PopulatedTeamType } from "../types";
import { revalidatePath } from "next/cache";
import Comment from "../models/comment.model";
import { redirect } from "next/navigation";
import Chat from "../models/chat.model";
import Messege from "../models/messege";
import mongoose, { ObjectId } from "mongoose";
import { Types } from "mongoose";

type createTeamParams = {
   name: string
   usersEmails: string[],
   adminClerkId?: string
}


export async function createTeam({ name, usersEmails, adminClerkId }: createTeamParams, type?: 'json') {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectToDB();

    const existingUsers = await User.find({ email: { $in: usersEmails } }).session(session);

    if (!adminClerkId) {
      throw new Error(`Error creating team, no admin clerk id`);
    }

    const admin = await User.findOne({ clerkId: adminClerkId }).session(session);
    if (!admin) {
      throw new Error(`Error creating team, no admin user found`);
    }

    const teamMembers = [
      ...existingUsers.map((user) => ({ user: user._id, role: 'Member' })),
      { user: admin._id, role: 'Admin' }
    ];

    const createdTeam = await Team.create([{ 
      name, 
      members: teamMembers, 
      invitedMembers: usersEmails 
    }], { session });

    for (const user of existingUsers) {
      user.teams.push(createdTeam[0]._id);
      await user.save({ session });
    }

    admin.teams.push(createdTeam[0]._id);
    await admin.save({ session });

    const firstBoard = await Board.create([{ 
      name: 'Kolos 1', 
      team: createdTeam[0]._id 
    }], { session });

    if (firstBoard) {
      const columns = [
        { name: "Backlog", textColor: "#737373", board: firstBoard[0]._id },
        { name: "TODO", textColor: "#fef08a", board: firstBoard[0]._id },
        { name: "In Progress", textColor: "#bfdbfe", board: firstBoard[0]._id },
        { name: "Done", textColor: "#a7f3d0", board: firstBoard[0]._id }
      ];

      const firstColumns = await Column.insertMany(columns, { session });
      const TODOColumn = firstColumns.find((column) => column.name === "TODO");

      const exampleTask = {
        description: "Meet Copper Group Kolos board",
        board: firstBoard[0]._id,
        author: admin._id,
        column: TODOColumn._id,
        assignedTo: [admin._id],
        parentId: null,
        subTasks: [],
        linkedTasks: [],
        comments: [],
        team: createdTeam[0]._id,
        type: "Issue",
        location: 'Board'
      };

      const firstTask = await Task.create([exampleTask], { session });
      if (firstTask) {
        const firstComment = await Comment.create([{ 
          content: "Move to DONE, when finished😉", 
          author: admin._id, 
          task: firstTask[0]._id 
        }], { session });

        firstTask[0].comments.push(firstComment[0]._id);
        await firstTask[0].save({ session });

        firstBoard[0].tasks.push(firstTask[0]._id);
        createdTeam[0].tasks.push(firstTask[0]._id);
      }

      firstBoard[0].columns = firstColumns;
      await firstBoard[0].save({ session });

      createdTeam[0].boards.push(firstBoard[0]._id);
    }

    let systemUser = await User.findOne({ email: "system@kolos.com" }).session(session);

    if (!systemUser) {
      systemUser = await User.create([{
        name: "Kolos AI",
        email: "system@kolos.com",
        clerkId: "system",
        teams: [],
      }], { session });
      systemUser = systemUser[0];
    }

    const systemChat = await Chat.create([{ 
      name: "Kolos AI", 
      team: createdTeam[0]._id, 
      people: [systemUser._id, admin._id], 
      messages: [] 
    }], { session });

    if (systemChat) {
      const welcomeMessege = await Messege.create([{ 
        content: "Thank you for choosing Kolos. We hope you will have a great time working with us!", 
        sender: systemUser._id, 
        type: "Default" 
      }], { session });

      systemChat[0].messeges.push(welcomeMessege[0]._id);
      await systemChat[0].save({ session });

      createdTeam[0].chats.push(systemChat[0]._id);
      await createdTeam[0].save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    revalidatePath("/dashboard");

    if (type === 'json') {
      return JSON.stringify(createdTeam[0]);
    } else {
      return createdTeam[0];
    }
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw new Error(`Error creating team: ${error.message}`);
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

export async function fetchTeamName({ teamId }: { teamId: string} ) {
  try {
    connectToDB()

    const team = await Team.findById(teamId);
    
    if(!team) redirect("/")

    return team.name
  } catch (error: any) {
    throw new Error(`Error fetching team name: ${error.message}`)
  }
}

export async function joinTeam({ clerkId, teamId }: { clerkId?: string, teamId: string }): Promise<string> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectToDB();

    const user = await User.findOne({ clerkId }).session(session);

    if (!user) {
      throw new Error("User not found");
    }

    const team = await Team.findById(teamId).session(session);

    if (!team) {
      throw new Error("Team not found");
    }

    if (team.invitedMembers.includes(user.email)) {
      team.invitedMembers = team.invitedMembers.filter((email: string) => email !== user.email);
      team.members.push({ user: user._id, role: "Member" });
      user.teams.push(team._id);

      await team.save({ session });
      await user.save({ session });

      await session.commitTransaction();
      session.endSession();

      return `/dashboard/team/${team._id}`;
    } else {
      let systemUser = await User.findOne({ email: "system@kolos.com" }).session(session);

      if (!systemUser) {
        systemUser = await User.create([{
          name: "Kolos AI",
          email: "system@kolos.com",
          clerkId: "system",
          teams: [],
        }], { session });
        systemUser = systemUser[0];
      }

      if (user && team) {
        const messegeContent = `
          <div style="display: flex; align-items: center; padding: 10px; background-color: #f4f4f4; border-radius: 8px;">
            <img src="${user.profilePicture || '/default-avatar.png'}" alt="${user.name}" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 10px;">
            <div>
              <p style="margin: 0; font-size: 16px; font-weight: bold;">${user.name}</p>
              <p style="margin: 0; font-size: 14px; color: #555;"><strong>Email:</strong> ${user.email}</p>
              <p style="margin: 5px 0; font-size: 14px;">has sent a request to join your team. Please review and respond accordingly.</p>
            </div>
          </div>
        `;
        
        const requestMessege = new Messege({
          content: messegeContent,
          sender: systemUser._id,
          type: "Request",
          readBy: [],
        });

        await requestMessege.save({ session });

        const adminId = team.members.find((member: TeamType["members"][number]) => member.role === 'Admin').user;

        const chat = await Chat.findOne({ team: team._id, people: [systemUser._id, adminId] }).session(session);

        if (chat) {
          chat.messeges.push(requestMessege._id);
          await chat.save({ session });
        }

        team.requests.push(user._id);
        user.requests.push(team._id);

        await team.save({ session });
        await user.save({ session });
        
        await session.commitTransaction();
        session.endSession();

        return '/requestSent';
      } else {
        throw new Error('User or Admin not found');
      }
    }
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw new Error(`Error joining team: ${error.message}`);
  }
}

export async function performRquestAction({
  teamId,
  messegeContent,
  messegeId,
  action,
}: {
  teamId: string;
  messegeContent: string;
  messegeId: string;
  action: "Accept" | "Refuse";
}): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const team = await Team.findById(teamId).session(session);
    if (!team) {
      throw new Error("Team not found");
    }

    const userEmail = messegeContent.match(/<strong>Email:<\/strong>\s*(.*?)<\/p>/)?.[1];
    if (!userEmail) {
      throw new Error("User email not found in message content");
    }

    const user = await User.findOne({ email: userEmail }).session(session);
    if (!user) {
      throw new Error("User not found");
    }

    if (!team.requests.includes(user._id) || !user.requests.includes(team._id)) {
      throw new Error("Request not found in the user's or team's request list");
    }

    if (action === "Accept") {
      // Move teamId into user's teams and add user as 'Member' in the team
      team.members.push({ user: user._id, role: "Member" });
      user.teams.push(team._id);

      // Remove user from team's requests and team from user's requests
      team.requests = team.requests.filter((request: Types.ObjectId) => !request.equals(user._id));
      user.requests = user.requests.filter((request: Types.ObjectId) => !request.equals(team._id));

      // Update message type to "Request-accepted"
      const message = await Messege.findById(messegeId).session(session);
      if (message) {
        message.type = "Request-accepted";
        await message.save({ session });
      }

      // Save changes to user and team
      await team.save({ session });
      await user.save({ session });

      // Commit transaction
      await session.commitTransaction();
      session.endSession();
    } 
    else if (action === "Refuse") {
      // Remove user from team's requests and team from user's requests
      team.requests = team.requests.filter((request: Types.ObjectId) => !request.equals(user._id));
      user.requests = user.requests.filter((request: Types.ObjectId) => !request.equals(team._id));

      // Update message type to "Request-refused"
      const message = await Messege.findById(messegeId).session(session);
      if (message) {
        message.type = "Request-refused";
        await message.save({ session });
      }

      // Save changes to user and team
      await team.save({ session });
      await user.save({ session });

      await session.commitTransaction();
      session.endSession();
    } else {
      throw new Error("Invalid action. Use 'Accept' or 'Refuse'.");
    }
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();
    throw new Error(`Error processing request action: ${error.message}`);
  }
}
