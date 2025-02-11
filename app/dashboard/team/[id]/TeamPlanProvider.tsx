"use client";

import { getTeamPlan } from "@/lib/actions/team.actions";
import React, { createContext, useContext } from "react";

// Define the context value type
type TeamPlanContextType = {
  fetchTeamPlan: (teamId: string) => Promise<string | null>;
};

// Create the TeamPlan Context
const TeamPlanContext = createContext<TeamPlanContextType | undefined>(undefined);

// Custom hook to use the TeamPlan Context
export const useTeamPlan = (teamId: string): Promise<string | null> => {
  const context = useContext(TeamPlanContext);
  if (!context) {
    throw new Error("useTeamPlan must be used within a TeamPlanProvider");
  }
  return context.fetchTeamPlan(teamId);
};

type TeamPlanProviderProps = {
  children: React.ReactNode;
};

export const TeamPlanProvider: React.FC<TeamPlanProviderProps> = ({ children }) => {
  // Function to fetch the team plan from the database
  const fetchTeamPlan = async (teamId: string): Promise<string | null> => {
    try {
      const plan = await getTeamPlan({ teamId });
      return plan;
    } catch (error) {
      console.error("Error fetching team plan", error);
      return null;
    }
  };

  return (
    <TeamPlanContext.Provider value={{ fetchTeamPlan }}>
      {children}
    </TeamPlanContext.Provider>
  );
};
