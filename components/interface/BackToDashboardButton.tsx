"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";


const BackToDashboardButton  = () => {
    const router = useRouter();

    const onClick = () => {
        router.push("/dashboard")
    }
    
    return (
        <Button
        onClick={onClick}
        className="w-full coppergroup-gradient text-md text-white"
        >
        Return to Dashboard
        </Button>
    );
};

export default BackToDashboardButton;
