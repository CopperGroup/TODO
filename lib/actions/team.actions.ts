"use server";

import Team, { TeamType } from "../models/team.model";
import User, { UserType } from "../models/user.model";
import { connectToDB } from "../mongoose";
import Board, { BoardType } from "../models/board.model";
import Column, { ColumnType } from "../models/column.model";
import Task, { TaskType } from "../models/task.model";
import { PopulatedTeamType, TeamTasks } from "../types";
import { revalidatePath } from "next/cache";
import Comment from "../models/comment.model";
import { redirect } from "next/navigation";
import Chat, { ChatType } from "../models/chat.model";
import Messege, { MessegeType } from "../models/messege";
import mongoose, { ObjectId } from "mongoose";
import { Types } from "mongoose";

type createTeamParams = {
  name: string
  usersEmails: string[],
  adminClerkId?: string,
  plan: string,
}


export async function createTeam({ name, usersEmails, adminClerkId, plan }: createTeamParams, type?: 'json') {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectToDB();

    const existingUsers: any[] = [];

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
      invitedMembers: usersEmails,
      plan
    }], { session });

    for (const user of existingUsers) {
      user.teams.push(createdTeam[0]._id);
      await user.save({ session });
    }

    admin.teams.push(createdTeam[0]._id);
    await admin.save({ session });

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
        type: "Default", 
        chat: systemChat[0]._id
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
      return createdTeam[0]._id.toString();
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

    connectToDB();

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
      .populate({ path: "boards", model: 'Board', select: "_id name"})
      .populate({path: "tasks", model: 'Task'})
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
export async function fetchSidebarInfo(
  { clerkId }: { clerkId: string | undefined }
): Promise<{
  user: UserType;
  teams: {
    teamId: string;
    name: string;
    teamColor: string;
    boards: { boardId: string; name: string }[];
    members: { user: string; role: 'Admin' | 'Member' }[];
    userUnreadMesseges: number,
    plan: 'basic_plan' | 'pro_plan'
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
      .populate(
        [
          {
            path: 'boards', 
            select: '_id name'
          },
          {
            path: 'chats',
            populate: {
              path: 'messeges'
            }
          }
        ]
      )
      .exec();

    const teamsInfo = teams.map((team) => {
      // Filter chats where the current user is in the chat's people array
      const relevantChats = team.chats.filter((chat: ChatType) =>
        chat.people.map((p) => p.toString()).includes(user._id.toString())
      );

      let totalUnreadMessages = 0;

      // Count unread messages for each relevant chat
      relevantChats.forEach((chat: (ChatType & { messeges: MessegeType[] })) => {
        const unreadMessages = chat.messeges.filter(
          (message: MessegeType) =>
            !message.readBy.includes(user._id.toString()) && // User hasn't read the message
            message.sender !== user._id.toString() // Exclude messages sent by the user
        );

        totalUnreadMessages += unreadMessages.length;
      });

      return {
        teamId: team._id.toString(),
        name: team.name,
        teamColor: team.themeColor,
        boards: team.boards.map((board: { _id: string; name: string }) => ({
          boardId: board._id.toString(),
          name: board.name,
        })),
        members: team.members.map((member: { user: string; role: "Admin" | "Member" }) => ({
          user: member.user,
          role: member.role as "Admin" | "Member",
        })),
        userUnreadMesseges: totalUnreadMessages,
        plan: team.plan
      };
    });

    return { user, teams: teamsInfo };
  } catch (error: any) {
    throw new Error(`Error fetching sidebar info: ${error.message}`);
  }
}

export async function fetchTeamName({ teamId, clerkId }: { teamId: string, clerkId?: string } ) {
  try {
    connectToDB()

    const team = await Team.findById(teamId);
    
    if(!team) redirect("/")

    let triggerRedirect = false;

    console.log(clerkId)
    if(clerkId) {
      const user = await User.findOne({ clerkId })

      console.log(user)
      if(team.members.map((member: { user: string }) => member.user.toString()).includes(user._id.toString())) {
        console.log('Should be redirected')
        triggerRedirect = true
      }
    }
       
    return { teamName: team.name, triggerRedirect }
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
      team.members = Array.from(new Set([...team.members, { user: user._id, role: "Member" }]));
      user.teams = Array.from(new Set([...user.teams, team._id]));

      // Create a chat with every team member if it doesn't already exist
      const teamMembers = team.members.map((member: any) => member.user);
      for (const memberId of teamMembers) {
        if (memberId.toString() !== user._id.toString()) {
          const existingChat = await Chat.findOne({
            people: { $all: [user._id, memberId] },
          }).session(session);

          if (!existingChat) {
            // Create a new chat between the user and the team member
            const chat = new Chat({
              name: `Chat between ${user.name} and ${memberId}`, // You can customize the chat name
              team: team._id,
              people: [user._id, memberId],
            });

            team.chats.push(chat._id)
            await chat.save({ session });
          }
        }
      }

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
        
        const adminId = team.members.find((member: TeamType["members"][number]) => member.role === 'Admin').user;
        
        const chat = await Chat.findOne({ team: team._id, people: [systemUser._id, adminId] }).session(session);

        if (!chat) {
          throw new Error('System-Admin chat not found');
        }

        const requestMessege = new Messege({
          content: messegeContent,
          sender: systemUser._id,
          type: "Request",
          readBy: [],
          chat: chat._id
        });

        await requestMessege.save({ session });

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

export async function performRequestAction({
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
    const team = await Team.findById(teamId).populate("members.user").session(session);
    if (!team) throw new Error("Team not found");

    const userEmail = messegeContent.match(/<strong>Email:<\/strong>\s*(.*?)<\/p>/)?.[1];
    if (!userEmail) throw new Error("User email not found in message content");

    const user = await User.findOne({ email: userEmail }).session(session);
    if (!user) throw new Error("User not found");

    if (!team.requests.includes(user._id) || !user.requests.includes(team._id)) {
      throw new Error("Request not found in the user's or team's request list");
    }

    if (action === "Accept") {
      // Convert teams and members to Sets to avoid duplicates
      user.teams = Array.from(new Set([...user.teams, team._id]));
      team.members = Array.from(new Set([...team.members, { user: user._id, role: "Member" }]));
      team.requests = team.requests.filter((request: Types.ObjectId) => !request.equals(user._id));
      user.requests = user.requests.filter((request: Types.ObjectId) => !request.equals(team._id));

      // Create a private chat between the new user and each existing team member
      for (const member of team.members) {
        const memberId = member.user._id.toString();
        const userId = user._id.toString();

        if (memberId !== userId) {
          const existingChat = await Chat.findOne({
            team: team._id,
            people: { $all: [userId, memberId] },
          }).session(session);

          if (!existingChat) {
            const newChat = await Chat.create(
              [
                {
                  name: "Private Chat",
                  team: team._id,
                  people: [userId, memberId],
                  messages: [],
                },
              ],
              { session }
            );

            team.chats.push(newChat[0]._id);
          }
        }
      }

      // Update message type to "Request-accepted"
      const message = await Messege.findById(messegeId).session(session);
      if (message) {
        message.type = "Request-accepted";
        await message.save({ session });
      }

      await team.save({ session });
      await user.save({ session });

      await session.commitTransaction();
      session.endSession();
    } else if (action === "Refuse") {
      // Remove user from team's requests and team from user's requests
      team.requests = team.requests.filter((request: Types.ObjectId) => !request.equals(user._id));
      user.requests = user.requests.filter((request: Types.ObjectId) => !request.equals(team._id));

      // Update message type to "Request-refused"
      const message = await Messege.findById(messegeId).session(session);
      if (message) {
        message.type = "Request-refused";
        await message.save({ session });
      }

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


export async function fetchTeamMembers({ teamId }: { teamId: string }): Promise<TeamType & { members: { user: UserType, role: 'Admin' | 'Member' }[] }>;
export async function fetchTeamMembers({ teamId }: { teamId: string }, type: 'json'): Promise<string>;

export async function fetchTeamMembers({ teamId }: { teamId: string }, type?: 'json') {
   try {
    connectToDB();

    const team = await Team.findById(teamId).populate({
      path: 'members.user'
    })

    if(!team) {
      throw new Error("Team not found ")
    }


    if(type === 'json'){
      return JSON.stringify(team)
    } else {
      return team
    }
   } catch (error: any) {
     throw new Error(`Erorr fetching team members ${error.message}`)
   }
}

export async function addInvitees({ teamId, invitedEmailsList }: { teamId: string, invitedEmailsList: string[] }): Promise<void> {
  try {
    connectToDB()

    const team = await Team.findByIdAndUpdate(
      teamId,
      {
        $addToSet: { invitedMembers: { $each: invitedEmailsList } }
      }
    )

    if (!team) {
      throw new Error("Team not found");
    }
  } catch (error: any) {
    throw new Error(`Error addingid invited users: ${error.message}`)
  }
}

export async function kickUserOut({ teamId, userId }: { teamId: string, userId: string }) {
  connectToDB();

  const session = await mongoose.startSession();
  try {
    
    session.startTransaction();
    const team = await Team.findById(teamId).session(session).populate("members.user");
    if (!team) throw new Error("Team not found");

    // Find the team admin
    const teamAdmin = team.members.find((member: any) => member.role === "Admin");
    if (!teamAdmin) throw new Error("Team admin not found");

    // Find the user to be kicked out
    const user = await User.findById(userId).session(session);
    if (!user) throw new Error("User not found");

    // Update all tasks created by the user: Change author to team admin
    await Task.updateMany(
      { author: user._id, team: teamId },
      { author: teamAdmin.user._id },
      { session }
    );

    // Remove the user from assignedTo in all tasks for this team
    await Task.updateMany(
      { team: teamId },
      { $pull: { assignedTo: user._id } },
      { session }
    );

    // Remove the user from the team members
    await Team.findByIdAndUpdate(teamId, {
      $pull: { members: { user: user._id } },
    }, { session });

    // Remove the team from the user's teams array
    await User.findByIdAndUpdate(user._id, {
      $pull: { teams: teamId },
    }, { session });

    // Commit the transaction
    await session.commitTransaction();
  } catch (error: any) {
    // If any error happens, abort the transaction
    await session.abortTransaction();
    throw new Error(`Error: ${error.message}`);
  } finally {
    // End the session
    session.endSession();

    revalidatePath(`/dashboard/team/${teamId}/members`)
  }
}



export async function fetchTeamTasks({ teamId }: { teamId: string }): Promise<TeamTasks>;
export async function fetchTeamTasks({ teamId }: { teamId: string }, type: 'json'): Promise<string>;

export async function fetchTeamTasks({ teamId }: { teamId: string }, type?: 'json') {
   try {
      
    connectToDB();

    const team = await Team.findById(teamId).populate(
      [
        {
          path: 'members.user',
        },
        {
          path: 'tasks',
          populate: [
            {
              path: 'author'
            },
            {
              path: 'column',
            },
            {
              path: 'board',
              populate: {
                path: 'columns'
              }
            }, 
            {
              path: 'assignedTo'
            },
            {
              path: 'parentId'
            },
            {
              path: 'subTasks'
            },
            {
              path: 'linkedTasks'
            },
          ]
        }
      ]
    )

    if(!team) {
      throw new Error('Team not found ')
    }
    if(type === 'json'){
      return JSON.stringify(team)
    } else {
      return team
    }
   } catch (error: any) {
     throw new Error(`${error.message}`)
   }
}

export async function calculateSummary({ teamId }: { teamId: string }) {
  try {
    // Connect to DB
    connectToDB();

    // Step 1: Fetch team and deep populate boards, columns, and tasks in one query
    const team = await Team.findById(teamId)
      .populate({
        path: "boards",  // Populate boards
        populate: [
          {
            path: "tasks", 
            populate: {
              path: "column",  // Populate column in task (to get column names like 'Done', 'TODO', etc.)
              model: Column
            },
          },
          {
            path: 'columns',
            model: Column
          }
        ]
      });

    if (!team) {
      throw new Error("Team not found");
    }

    // Step 2: Count active members (those with a role of 'Admin' or 'Member')
    const activeMembers = team.members.filter((member: any) => member.role === "Admin" || member.role === "Member").length;

    // Initialize variables to hold totals
    let totalTasks = 0;
    let totalColumns = 0;
    let completedTasks = 0;
    let backlogTasks = 0;
    let todoTasks = 0;
    let inProgressTasks = 0;

    // Initialize variables for other columns
    let otherColumnsTasks: Record<string, number> = {};

    // Step 3: Loop through all boards and fetch columns and tasks already populated
    for (const board of team.boards) {
      // Increment the total number of columns and tasks
      totalColumns += board.columns.length;
      totalTasks += board.tasks.length;

      // Step 4: Calculate the task totals per column and overall task completion
      for (const task of board.tasks) {
        if (task.column) {
          // Column is already populated, so we can access the name directly
          const columnName = task.column.name;

          // Increment task counters based on the column
          if (columnName === "Done") {
            completedTasks++;
          } else if (columnName === "Backlog") {
            backlogTasks++;
          } else if (columnName === "TODO") {
            todoTasks++;
          } else if (columnName === "In Progress") {
            inProgressTasks++;
          } else {
            // Handle other columns dynamically
            if (!otherColumnsTasks[columnName]) {
              otherColumnsTasks[columnName] = 0;
            }
            otherColumnsTasks[columnName]++;
          }
        }
      }
    }

    // Calculate completion rate
    const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : "0.0";

    return {
      totalTasks,
      totalColumns,
      completedTasks,
      backlogTasks,
      todoTasks,
      inProgressTasks,
      activeMembers,  // Add active members to the summary
      completionRate,
      otherColumnsTasks,  // Include tasks in other columns
    };
  } catch (error: any) {
    console.error("Error calculating summary:", error);
    throw new Error(`Error fetching summary: ${error.message}`);
  }
}


export async function getTeamPlan({ teamId }: { teamId: string }): Promise<string> {
  try {
    connectToDB()

    const team = await Team.findById(teamId);

    if(!team) {
      throw new Error('Team not found ')
    }

    return team.plan
  } catch (error: any) {
    throw new Error(`${error.message}`)
  }
}

export async function updateTeamPlan({ teamId, planName }: { teamId: string, planName: string }) {
  try {
    connectToDB();

    await Team.findByIdAndUpdate(
      teamId, {
        plan: planName
      }
    )
  } catch (error: any) {
    throw new Error(`${error.message}`)
  }
}

export async function fetchTeamPlan({ teamId }: { teamId: string}): Promise<string> {
  try {
    connectToDB();

    const team = await Team.findById(teamId);

    if(!team) {
      throw new Error("Team not found ")
    }

    return team.plan
  } catch (error: any) {
    throw new Error(`Error fetching team plan ${error.message}`)
  }
}