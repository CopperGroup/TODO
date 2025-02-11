const plansStripe = {
  "plans": [
    {
      "id": "basic_plan",
      "product": "team_management",
      "nickname": "Basic Plan",
      "amount": 900,
      "currency": "usd",
      "interval": "month",
      "billing_scheme": "per_unit",
      "tiers": [],
      "metadata": {
        "team_members": "Up to 10 members",
        "boards": "Up to 3 boards",
        "tasks": "Up to 50 tasks",
        "storage": "50 MB for file attachments",
        "task_tracking": "Basic task management",
        "support": "Email support"
      }
    },
    {
      "id": "pro_plan",
      "product": "team_management",
      "nickname": "Pro Plan",
      "amount": 2900,
      "currency": "usd",
      "interval": "month",
      "billing_scheme": "per_unit",
      "tiers": [],
      "metadata": {
        "team_members": "Unlimited members",
        "boards": "Unlimited boards",
        "tasks": "Unlimited tasks",
        "storage": "5 GB for file attachments",
        "task_tracking": "Advanced task management",
        "support": "Priority email and chat support"
      }
    }
  ]
}

const plans = [
    {
      name: "basic_plan",
      price: 9,
      currency: "USD",
      billing_cycle: "monthly",
      features: {
        team_members: 10, // Max number of members
        boards: 3,         // Max number of boards
        tasks: 50,         // Max number of tasks
        storage: 50,       // File storage in MB
        task_tracking: "basic", // Task tracking level
        support: "email"   // Support type
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
        support: "priority"     // Support type
      }
    }
  ];
  
  export default plans;
  