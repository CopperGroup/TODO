"use client";

import MeetingRoom from '@/components/admin-components/Meetings/MeetingRoom/MeetingRoom';
import MeetingSetup from '@/components/admin-components/Meetings/MeetingRoom/MeetingSetup';
import { useGetCallById } from '@/hooks/useGetCallById';
import { useUser } from '@clerk/nextjs';
import { StreamCall, StreamTheme } from '@stream-io/video-react-sdk';
import { useState } from 'react';

const Meeting  = ({ params }: { params: { meetingId: string } }) => {
    const [isSetupComplete, setisSetupComplete] = useState(false);
    const { call, isCallLoading } = useGetCallById(params.meetingId)
    const { user, isLoaded } = useUser();

    console.log(params.meetingId, call)

    if (!isLoaded || isCallLoading) return <h1>Loading</h1>;

    if (!call) return (
      <p className="text-center text-3xl font-bold text-white">
        Call Not Found
      </p>
    );
  
    return (
        <div className='relative h-full w-full'>
            <StreamCall call={call}>
                <StreamTheme>
                    {isSetupComplete ? (
                        <MeetingRoom />
                    ): (
                        <MeetingSetup setIsSetUpComplete={setisSetupComplete}/>
                    )}
                </StreamTheme>
            </StreamCall>
        </div>
    )
}

export default Meeting 