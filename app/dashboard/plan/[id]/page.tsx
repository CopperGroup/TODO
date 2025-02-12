"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { checkoutPlan } from "@/lib/actions/transaction.actions";
import { useUser } from "@clerk/nextjs";
import { loadStripe } from "@stripe/stripe-js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Users, Layout, FileText, HardDrive, Activity, Columns, MessageCircle, Star } from "lucide-react";
import SubtleBackground from "@/components/backgrounds/SubtleBackground";
import { useTeamPlan } from "../../team/[id]/TeamPlanProvider";

const plans = {
  basic_plan: {
    name: "Basic",
    price: 9,
    currency: "USD",
    billing_cycle: "monthly",
    description: "Essential features for small teams",
    features: {
      team_members: 10,
      boards: 1,
      tasks: 100,
      storage: 50,
      task_tracking: "basic",
      custom_columns: false,
      chats: false,
    },
  },
  pro_plan: {
    name: "Pro",
    price: 29,
    currency: "USD",
    billing_cycle: "monthly",
    description: "Advanced features for growing teams",
    features: {
      team_members: Infinity,
      boards: 12,
      tasks: Infinity,
      storage: 5000,
      task_tracking: "advanced",
      custom_columns: true,
      chats: true,
    },
  },
  tester_plan: {
    name: "Tester",
    price: 0,
    currency: "USD",
    billing_cycle: "N/A",
    description: "Help shape our product's future",
    features: {},
  },
};

export default function BillingPlans({ params }: { params: { id: string } }) {
  const { user } = useUser();
  const { toast } = useToast();

  const [selectedPlan, setSelectedPlan] = useState<string>("");
  useEffect(() => {
      loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
    }, []);
    
    const [currentPlan, setCurrentPlan] = useState<string | null>(null);
    
    // Fetch team plan when the component mounts
    useEffect(() => {
        const fetchPlan = async () => {
            const plan = await useTeamPlan(params.id);
            setCurrentPlan(plan);
            setSelectedPlan(plan || "")
        };
        
        fetchPlan();
    }, [params.id]);
    
    
    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        if (query.get("success")) {
            toast({ title: "Order placed!", description: "You will receive an email confirmation", duration: 5000 });
        }
        if (query.get("canceled")) {
            toast({ title: "Order canceled!", description: "Continue to shop around and checkout when you're ready", duration: 5000 });
        }
    }, [toast]);
    
    if(!params.id) {
      return null
    }
    
    const onCheckout = async () => {
        if (!selectedPlan || selectedPlan === currentPlan) return;
        const transaction = { plan: selectedPlan, teamId: params.id, clerkId: user?.id };
        await checkoutPlan(transaction);
    };
    
    const renderFeatures = (planId: string, features: Record<string, any>) => {
    if (planId === "tester_plan") return null;

    const featureIcons = {
      team_members: Users,
      boards: Layout,
      tasks: FileText,
      storage: HardDrive,
      task_tracking: Activity,
      custom_columns: Columns,
      chats: MessageCircle,
    };

    return (
      <ul className="space-y-1 text-sm">
        {Object.entries(features).map(([feature, value]) => {
          const Icon = featureIcons[feature as keyof typeof featureIcons];
          return (
            <li key={feature} className="flex items-center">
              {value ? <Check className="mr-2 h-3 w-3 text-green-500" /> : <X className="mr-2 h-3 w-3 text-red-500" />}
              <Icon className="mr-2 h-3 w-3 text-gray-400" />
              <span className="capitalize text-gray-600">
                {feature.replace("_", " ")}: {typeof value === "boolean" ? (value ? "Yes" : "No") : value === Infinity ? "Unlimited" : value}
              </span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 bg-white">
      <SubtleBackground />
      <div className="relative z-10 w-full max-w-6xl">
        <h1 className="text-3xl font-bold text-center mb-6 coppergroup-gradient-text">Choose Your Plan</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(plans).map(([planId, plan]) => (
            <Card
              key={planId}
              className={`flex flex-col transition-all duration-300 ${
                selectedPlan === planId ? "ring-2 ring-gray-300 shadow-md" : "hover:shadow-sm"
              } ${planId === "pro_plan" ? "md:scale-102 z-10" : ""} ${planId === currentPlan ? "border-2 border-gray-300" : ""}`}
            >
              <CardHeader className="pb-4">
                <CardTitle className={`text-xl ${planId === "pro_plan" ? "coppergroup-gradient-text" : "text-gray-900"}`}>
                  {plan.name}
                  {planId === "pro_plan" && <Star className="ml-1 h-4 w-4 text-yellow-400 inline-block" />}
                </CardTitle>
                <CardDescription>{plan.price === 0 ? "Free" : `$${plan.price}/${plan.billing_cycle}`}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-3">{plan.description}</p>
                {renderFeatures(planId, plan.features)}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => setSelectedPlan(planId)}
                  className={`w-full ${selectedPlan === planId ? "coppergroup-gradient text-white" : "bg-gray-100 text-gray-800 hover:text-black"} hover:bg-neutral-200 `}
                  disabled={planId === currentPlan}
                >
                  {planId === currentPlan ? "Current Plan" : selectedPlan === planId ? "Selected" : "Select Plan"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        {selectedPlan && selectedPlan !== "tester_plan" && selectedPlan !== currentPlan && (
          <div className="mt-6 text-center">
            <Button onClick={onCheckout} className="px-8 py-2 text-base font-semibold coppergroup-gradient text-white">
              Upgrade Now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
