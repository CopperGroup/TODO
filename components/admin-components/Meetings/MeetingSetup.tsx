"use client";

import { Button } from "@/components/ui/button";
import { DeviceSettings, useCall, VideoPreview } from "@stream-io/video-react-sdk"
import React, { SetStateAction, useEffect, useState } from "react"

const MeetingSetup = ({ setIsSetUpComplete }: { setIsSetUpComplete: React.Dispatch<SetStateAction<boolean>>}) => {
    const [isMicCamOn, setIsMicCamOn] = useState(false);

    const call = useCall();

    if(!call) {
        throw new Error("useCall() must be used within StreamCall component")
    }
    useEffect(() => {
        if(isMicCamOn) {
            call?.camera.disable();
            call?.microphone.disable();
        } else {
            call?.camera.enable();
            call?.microphone.enable();
        }

    }, [isMicCamOn, call?.camera, call?.microphone])

    return (
        <div className="w-full h-screen flex justify-center items-center">
            <div className="max-w-[600px]">
                <VideoPreview />
                <DeviceSettings />
                <Button 
                 onClick={() => {
                    call.join()
                    setIsSetUpComplete(true)
                 }}>
                    Join meeting
                </Button>
            </div>
        </div>
    )
}

export default MeetingSetup