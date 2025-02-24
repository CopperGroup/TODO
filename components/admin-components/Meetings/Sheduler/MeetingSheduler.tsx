"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus, Video } from "lucide-react"
import ScheduleGrid from "./ShedulerGrid"
import AddMeetingModal from "./AddMeetingModal"
import { TeamMeetingsType } from "@/lib/types"
import { useRouter } from "next/navigation"
import { useGetLiveCalls } from "@/hooks/useGetLiveCalls"
import LiveCallsModal from "./LiveCallsModal"

const views = ["Week", "Next week", "Month"] as const
type View = (typeof views)[number]

type Meeting = TeamMeetingsType["meetings"][number]

export default function MeetingScheduler({ stringifiedTeamWithMeetings }: { stringifiedTeamWithMeetings: string }) {
  const team: TeamMeetingsType = JSON.parse(stringifiedTeamWithMeetings);
  const [currentView, setCurrentView] = useState<View>("Week")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isLiveMeetingsModalOpen, setIsLiveMeetingsModalOpen] = useState(false)
  const [meetings, setMeetings] = useState<Meeting[]>(team.meetings || [])
  
  const router = useRouter();
  const { calls: liveMeetings } = useGetLiveCalls(team._id);

  console.log(liveMeetings)
  const handleAddMeeting = (meeting: Meeting) => {
    setMeetings(prev => ([...prev, meeting]))
  }

  const handleJoinMeeting = (meetingId: string) => {
    window.open(`/dashboard/team/${team._id}/meetings/${meetingId}`, "_blank");
  }

  return (
    <div className="w-full h-full bg-gray-900 text-white">
      <div className="relative w-full h-full">
        <Tabs defaultValue="Week" onValueChange={(value) => setCurrentView(value as View)} className="h-full">
          <TabsList className="fixed left-1/2 bottom-8 rounded-full z-20 bg-neutral-900">
            {views.map((view) => (
              <TabsTrigger key={view} value={view} className="rounded-full data-[state=active]:bg-neutral-800 data-[state=active]:text-white">
                {view}
              </TabsTrigger>
            ))}
          <Button
              onClick={() => setIsLiveMeetingsModalOpen(true)}
              className="w-fit h-fit text-xs rounded-full border border-blue-600 bg-blue-700/50 text-white py-[5px] px-4 ml-2 hover:bg-blue-700/80" 
              size="sm"
            >
              <Video className="h-3 w-3" />
              {liveMeetings.length} live
          </Button>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="w-fit h-fit rounded-full coppergroup-gradient text-white ml-2 p-1.5"
              size="sm"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </TabsList>
          {views.map((view) => (
            <TabsContent key={view} value={view} className="h-full mt-0">
              <div className="h-full">
                <ScheduleGrid view={view} meetings={meetings} onJoinMeeting={handleJoinMeeting}/>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      <AddMeetingModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} team={team} onAdd={handleAddMeeting}/>
      <LiveCallsModal isOpen={isLiveMeetingsModalOpen} onClose={() => setIsLiveMeetingsModalOpen(false)} liveMeetings={meetings.filter(meeting => liveMeetings.map(m => m.id).includes(meeting._id))} onJoinCall={handleJoinMeeting}/>
    </div>
  )
}

