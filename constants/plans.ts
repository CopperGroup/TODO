const plans = {
    "basic_plan": {
      price: 9,
      currency: "USD",
      billing_cycle: "monthly",
      features: {
        team_members: 10,
        boards: 1,
        tasks: Infinity,
        storage: 50,
        task_tracking: "basic",
        custom_columns: false,
        chats: false
      }
    },
    "pro_plan": {
      price: 29,
      currency: "USD",
      billing_cycle: "monthly",
      features: {
        team_members: Infinity, // Unlimited members
        boards: 12,     
        tasks: Infinity,        // Unlimited tasks
        storage: 5000,           // File storage in MB (5 GB)
        task_tracking: "advanced", // Task tracking level
        custom_columns: true,
        chats: true 
      }
    }
};
  
export default plans;