"use client";

import { Button } from "@/components/ui/button";
import { joinTeam } from "@/lib/actions/team.actions";
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function JoinTeamButton({ teamId }: { teamId: string }) {
  const { user } = useUser();
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      const redirectUrl = await joinTeam({ clerkId: user?.id, teamId });
      router.push(redirectUrl);
    } catch (error) {
      console.error("Failed to join team:", error);
      setIsJoining(false);
    }
  };

  return (
    <>
      <SignedIn>
        <Button
          type="button"
          className="w-full coppergroup-gradient text-md text-white"
          onClick={handleJoin}
          disabled={isJoining || !user}
        >
          {isJoining ? "Joining..." : "Join Team"}
        </Button>
      </SignedIn>
      <SignedOut>
        <SignInButton signUpForceRedirectUrl={`/join/${teamId}`}>
          <Button type="button" className="w-full coppergroup-gradient text-md text-white">
            Sign-in and Join Team
          </Button>
        </SignInButton>
      </SignedOut>
    </>
  );
}
