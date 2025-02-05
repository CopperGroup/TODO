export type PopulatedTeamType = {
    _id: string;
    name: string;
    users: {
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
  };


export interface Card {
  id: string
  title: string
  column: string
  position: number
}

export type Column = {
  id: string
  title: string
  position: number
  headingColor: string
}

