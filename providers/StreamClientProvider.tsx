"use client"

import { tokenProvider } from "@/lib/actions/stream.actions";
import { useUser } from "@clerk/nextjs";
import {
    StreamCall,
    StreamVideo,
    StreamVideoClient,
    User,
} from "@stream-io/video-react-sdk";
import { ReactNode, useEffect, useState } from "react";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

const StreamVideoProvider = ({ children }: { children: ReactNode}) => {
    const [videoClient, setvideoClient] = useState<StreamVideoClient>()

    const { user, isLoaded} = useUser();

    useEffect(() => {
        if(!isLoaded || !user) return;

        if(!apiKey) {
            throw new Error("Stream API key missing")
        }

        const client = new StreamVideoClient({
            apiKey,
            user: {
                id: user?.id,
                name: `${user?.firstName || ""} ${user?.lastName || ""}`,
                image: user?.imageUrl
            },
            tokenProvider
        })

        setvideoClient(client)
    }, [])
    
    if(!videoClient) {
        return <h1>Loading...</h1>
    }

    return (
        <StreamVideo client={videoClient}>
            {children}
        </StreamVideo>
    );
};

export default StreamVideoProvider