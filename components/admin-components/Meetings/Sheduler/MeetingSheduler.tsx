"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import AddMeetingModal from "./AddMeetingModal"

type Meeting = {
  id: string
  title: string
  start: Date
  duration: number // in minutes
}

const mockMeetings: Meeting[] = [
  { id: "1", title: "Team Sync", start: new Date("2025-02-19T09:00:00"), duration: 60 },
  { id: "2", title: "Project Review", start: new Date("2025-02-19T14:00:00"), duration: 90 },
  { id: "3", title: "Client Call", start: new Date("2025-02-20T11:00:00"), duration: 45 },
  { id: "4", title: "Sprint Planning", start: new Date("2025-02-21T10:00:00"), duration: 120 },
  { id: "5", title: "Design Workshop", start: new Date("2025-02-22T13:00:00"), duration: 180 },
  { id: "6", title: "Code Review", start: new Date("2025-02-23T15:00:00"), duration: 60 },
  { id: "7", title: "Team Building", start: new Date("2025-02-24T12:00:00"), duration: 240 },
]

const views = ["Week", "Day", "Month", "Next week"] as const
type View = (typeof views)[number]

export default function MeetingScheduler() {
  const [currentView, setCurrentView] = useState<View>("Week")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const handleAddMeeting = (newMeeting: Omit<Meeting, "id">) => {
    // In a real application, you would add this meeting to your database
    console.log("New meeting:", newMeeting)
    setIsAddModalOpen(false)
  }

  return (
    <div className="w-full h-full bg-background"> 
      <div className="relative w-full flex justify-between items-center mb-4">
        <Tabs defaultValue="Week" onValueChange={(value) => setCurrentView(value as View)}>
          <TabsList className="fixed left-1/2 bottom-8 rounded-full z-20">
            {views.map((view) => (
              <TabsTrigger key={view} value={view} className="rounded-full">
                {view}
              </TabsTrigger>
            ))}
            <Button onClick={() => setIsAddModalOpen(true)} className="p-2 rounded-full" size="sm">
                <Plus className="h-4 w-4" />
            </Button>
          </TabsList>
          {views.map((view) => (
            <TabsContent key={view} value={view} className="w-full">
              <ScrollArea className="w-full h-screen">
                <div className="min-w-max">
                  <ScheduleGrid view={view} meetings={mockMeetings} />
                </div>
                <ScrollBar orientation="vertical" />
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      <AddMeetingModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}/>
    </div>
  )
}

function ScheduleGrid({ view, meetings }: { view: View; meetings: Meeting[] }) {
  const columns = getColumnsForView(view)

  return (
    <div className="h-full grid pb-5" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(200px, 1fr))` }}>
      {columns.map((column, index) => (
        <div key={index} className="border-r border-border last:border-r-0">
          <div className="sticky top-0 bg-background z-10 p-2 text-center border-b border-border">
            {column.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </div>
          {view !== "Month" && (
            <div className="grid grid-rows-24 gap-0">
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="h-12 border-b border-border last:border-b-0 relative">
                  <span className="absolute top-0 left-2 text-xs text-muted-foreground">
                    {i === 0 ? "12 AM" : i < 12 ? `${i} AM` : i === 12 ? "12 PM" : `${i - 12} PM`}
                  </span>
                  {meetings
                    .filter((meeting) => isSameDay(meeting.start, column.date) && getHour(meeting.start) === i)
                    .map((meeting) => (
                      <div
                        key={meeting.id}
                        className="absolute left-0 right-0 bg-primary/10 border border-primary rounded p-1 text-xs overflow-hidden"
                        style={{
                          top: `${(getMinutes(meeting.start) / 60) * 100}%`,
                          height: `${(meeting.duration / 60) * 100}%`,
                        }}
                      >
                        {meeting.title}
                      </div>
                    ))}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function getColumnsForView(view: View): { date: Date }[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  switch (view) {
    case "Day":
      return [{ date: today }]
    case "Week":
      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today)
        date.setDate(date.getDate() - date.getDay() + i)
        return { date }
      })
    case "Month":
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      return Array.from({ length: new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() }, (_, i) => {
        const date = new Date(firstDayOfMonth)
        date.setDate(date.getDate() + i)
        return { date }
      })
    case "Next week":
      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today)
        date.setDate(date.getDate() - date.getDay() + i + 7)
        return { date }
      })
  }
}

function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

function getHour(date: Date) {
  return date.getHours()
}

function getMinutes(date: Date) {
  return date.getMinutes()
}

