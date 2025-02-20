"use client";

import MeetingScheduler from "@/components/admin-components/Meetings/Sheduler/MeetingSheduler";
import MeetingSchedulerViewer from "@/components/admin-components/Meetings/Sheduler/MeetingSheduler";
import { Button } from "@/components/ui/button";
import StreamVideoProvider from "@/providers/StreamClientProvider"
import { useUser } from "@clerk/nextjs";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Page = ({params }: { params: { id: string } }) => {
    const [values, setvalues] = useState({
        dateTime: new Date(),
        description: '',
        link: '',
    })
    const [callDetails, setcallDetails] = useState<Call>()

    const { user } = useUser();
    const client = useStreamVideoClient()
    const router = useRouter();

    if(!params.id) return

    const createMeeting = async () => {
        if(!client || !user) return;

        try {
            const id = crypto.randomUUID();

            const call = client.call('default', id);

            console.log(call)
            if(!call) throw new Error("FAiled to create call");

            const startsAt = values.dateTime.toISOString() ||
            new Date(Date.now()).toISOString();

            const description = values.description || "Team meetng";

            await call.getOrCreate({
                data: {
                    starts_at: startsAt,
                    custom: {
                        description
                    }
                }
            })

            setcallDetails(call)

            router.push(`meetings/${call.id}`)
        } catch (error: any) {
            console.log(error)
        }
    }

    return (
        <section className="w-full h-screen overflow-hidden">
            <MeetingScheduler />
        </section>
    )
}

export default Page