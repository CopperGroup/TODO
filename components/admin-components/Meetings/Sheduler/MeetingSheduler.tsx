"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import ScheduleGrid from "./ShedulerGrid"
import AddMeetingModal from "./AddMeetingModal"
import { TeamMeetingsType } from "@/lib/types"

type Meeting = {
  id: string
  title: string
  start: Date
  duration: number // in minutes
  attendees?: Array<{
    name: string
    avatar?: string
  }>
}

const mockMeetings: Meeting[] = [
  {
    id: "1",
    title: "Design review",
    start: new Date(2025, 1, 19, 9, 0),
    duration: 40,
  },
  {
    id: "2",
    title: "UI Updates",
    start: new Date(2025, 1, 19, 14, 0),
    duration: 90,
  },
  {
    id: "3",
    title: "Wireframes Discussion",
    start: new Date(2025, 1, 20, 11, 0),
    duration: 30,
  },
  {
    id: "4",
    title: "Out of office",
    start: new Date(2025, 1, 21, 14, 0),
    duration: 300,
  },
]

const views = ["Week", "Next week", "Month"] as const
type View = (typeof views)[number]

export default function MeetingScheduler({ stringifiedTeamWithMeetings }: { stringifiedTeamWithMeetings: string }) {
  const team:TeamMeetingsType = JSON.parse(stringifiedTeamWithMeetings);
  const [currentView, setCurrentView] = useState<View>("Week")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [meetings, setMeetings] = useState<TeamMeetingsType["meetings"]>(team.meetings || [])

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
                <ScheduleGrid view={view} meetings={meetings} />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      <AddMeetingModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} team={team}/>
    </div>
  )
}

