"use client";

import { Button } from "@/components/ui/button";
import { joinTeam } from "@/lib/actions/team.actions";
import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function JoinTeamButton({ teamId }: { teamId: string }) {
    const { user } = useUser();

    const router = useRouter();
    
    const handleJoin = async() => {
        const redirectUrl  = await joinTeam({ clerkId: user?.id, teamId });

        router.push(redirectUrl);
    }

    return (
        <>
            <SignedIn>
                <Button
                    type="button"
                    className="w-full coppergroup-gradient text-md text-white"
                    onClick={handleJoin}
                    disabled={!user}
                >
                    Join Team
                </Button>
            </SignedIn>
            <SignedOut>
                <SignInButton signUpForceRedirectUrl={`/join/${teamId}`}>
                <Button
                    type="button"
                    className="w-full coppergroup-gradient text-md text-white"
                    >
                    Sign-in and Join Team
                </Button>
                </SignInButton>
            </SignedOut>
        </>
    );
}
