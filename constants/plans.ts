const plans = [
    {
      name: "basic_plan",
      price: 9,
      currency: "USD",
      billing_cycle: "monthly",
      features: {
        team_members: 10, // Max number of members
        boards: 1,         // Max number of boards
        tasks: Infinity,         // Max number of tasks
        storage: 50,       // File storage in MB
        task_tracking: "basic", // Task tracking level
        custom_columns: false,
        chats: false
      }
    },
    {
      name: "pro_plan",
      price: 29,
      currency: "USD",
      billing_cycle: "monthly",
      features: {
        team_members: Infinity, // Unlimited members
        boards: Infinity,       // Unlimited boards
        tasks: Infinity,        // Unlimited tasks
        storage: 5000,           // File storage in MB (5 GB)
        task_tracking: "advanced", // Task tracking level
        custom_columns: true,
        chats: true 
      }
    }
] as const;
  
export default plans;