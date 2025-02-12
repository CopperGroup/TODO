
import { TeamType } from "./models/team.model";
import { TaskType } from "./models/task.model";
import { ColumnType } from "./models/column.model";
import { BoardType } from "./models/board.model";
import  { UserType as User } from "@/lib/models/user.model"

export type PopulatedTeamType = {
    _id: string;
    name: string;
    members: {
      user: {
        _id: string;
        name: string;
        email: string;
        profilePicture: string;
        role: "Admin" | "Member"; // Assuming you use these roles
        online: boolean;
      };
      role: "Admin" | "Member"; // Assuming you use these roles
    }[];
    boards: {
      _id: string;
      name: string;
    }[];
    tasks: {
      _id: string;
      description: string;
      author: {
        _id: string;
        name: string;
      };
      column: {
        _id: string;
        name: string;
      };
      assignedTo: {
        _id: string;
        name: string;
      }[];
      parentId: string | null; // This could be null if there is no parent task
      subTasks: string[]; // List of task IDs
      linkedTasks: string[]; // List of task IDs
      createdAt: Date;
      attachments: string[]; // List of file URLs
      commets: string[]; // List of comment IDs
      type: string; // The task type
    }[];
    invitedMembers: string[]; // List of emails for invited members
    themeColor: string;
    plan: 'basic_plan' | 'pro_plan'
  };


export interface Card {
  id: string
  title: string
  column: string
  type: string
}

export type Column = {
  _id: string
  name: string
  textColor: string
}

// Comment Type (Populated)
export type PopulatedCommentType = {
  _id: string;
  content: string;
  author: UserType; // Populated with User
  task: PopulatedTaskType; // Populated with Task
  attachments: string[];
  createdAt: Date

};

// Task Type (Populated)
export type PopulatedTaskType = {
  _id: string;
  description: string;
  author: UserType; // Populated with User
  column: PopulatedColumnType | string; // Populated with Column
  assignedTo: UserType[]; // Populated Users
  parentId: PopulatedTaskType | null | string; // Populated Task (if parent)
  subTasks: PopulatedTaskType[]; // Populated SubTasks
  linkedTasks: PopulatedTaskType[]; // Populated Linked Tasks
  createdAt: Date;
  labels: string[];
  attachments: string[];
  comments: PopulatedCommentType[]; // Populated Comments
  type?: string; // Optional task type
  tasksLinkedToThis: PopulatedTaskType[];
  board?: PopulatedBoardType | string;
  team: PopulatedTeamType;
  updatedAt: Date;
  location: 'Board' | 'Backlog'
};

// Column Type (Populated)
export type PopulatedColumnType = {
  _id: string;
  name: string;
  textColor: string;
  backgroundColor: string;
  board: PopulatedBoardType; // Populated with Board
};

// Board Type (Populated)
export type PopulatedBoardType = {
  _id: string;
  name: string;
  team: PopulatedTeamType; // Populated with Team
  columns: PopulatedColumnType[]; // Populated Columns
  tasks: PopulatedTaskType[];
};

// User Type (Populated for Author and Assignee)
export type UserType = {
  _id: string;
  name: string;
  email: string;
  profilePicture: string;
  // Add other fields you have in the User model
};

export type TeamPopulatedChatsType = Omit<TeamType, "chats"> & {
  chats: {
    _id: string
    name: string;
    messeges: {
      _id: string
      content: string;
      sender: User;
      type: string,
      readBy: {
        _id: string,
        clerkId: string
      }[]
      createdAt: Date
    }[];
    people: User[];
  }[];
};

export type TeamTasks = TeamType & {
  members: {
    user: UserType;
    role: "Admin" | "Member";
  }[];
  tasks: (TaskType & {
    author: User;
    column: ColumnType;
    board: BoardType & { columns: ColumnType[] };
    assignedTo: User[];
    parentId: TaskType | null;
    subTasks: TaskType[];
    linkedTasks: TaskType[];
  })[];
};
