"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { checkoutPlan } from "@/lib/actions/transaction.actions";
import { useUser } from "@clerk/nextjs";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect } from "react";

const Checkout = ({ params }: { params: { id: string } }) => {
  const { user } = useUser();

  const { toast } = useToast();
  
  useEffect(() => {
    loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }, []);
  
  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      toast({
        title: "Order placed!",
        description: "You will receive an email confirmation",
        duration: 5000,
        className: "success-toast",
      });
    }
    
    if (query.get("canceled")) {
      toast({
        title: "Order canceled!",
        description: "Continue to shop around and checkout when you're ready",
        duration: 5000,
        className: "error-toast",
      });
    }
  }, []);
  
  
  if(!params.id) return 

  const onCheckout = async () => {
    const transaction = {
      plan: 'pro_plan',
      teamId: params.id,
      clerkId: user?.id,
    };

    await checkoutPlan(transaction);
  };

  return (
    <form action={onCheckout} method="POST">
      <section>
        <Button
          type="submit"
          role="link"
          className="w-full rounded-full bg-purple-gradient bg-cover"
        >
          Buy 
        </Button>
      </section>
    </form>
  );
};

export default Checkout;