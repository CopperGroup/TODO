"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  differenceInMinutes,
  isBefore,
  isAfter,
  addMinutes,
} from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FaVideo } from "react-icons/fa"
import { TeamMeetingsType } from "@/lib/types"
import { cn } from "@/lib/utils"

type Meeting = {
  id: string
  title: string
  start: Date
  duration: number
  attendees?: Array<{
    name: string
    avatar?: string
  }>
}

type View = "Week" | "Day" | "Month" | "Next week"

type ScheduleGridProps = {
  view: View
  meetings: TeamMeetingsType["meetings"]
}

const columnColors = [
  "border-red-800 bg-red-800/10 hover:bg-red-800/20",
  "border-blue-800 bg-blue-800/10 hover:bg-blue-800/20",
  "border-green-800 bg-green-800/10 hover:bg-green-800/20",
  "border-yellow-800 bg-yellow-800/10 hover:bg-yellow-800/20",
  "border-purple-800 bg-purple-800/10 hover:bg-purple-800/20",
  "border-pink-800 bg-pink-800/10 hover:bg-pink-800/20",
  "border-indigo-800 bg-indigo-800/10 hover:bg-indigo-800/20",
]

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ view, meetings }) => {
  const [columns, setColumns] = useState<Date[]>([])
  const [currentDate] = useState(new Date())

  useEffect(() => {
    setColumns(getColumnsForView(view, currentDate))
  }, [view, currentDate])

  function getOccupiedHourSlots(meeting: TeamMeetingsType["meetings"][number]): Date[] {
    const start = new Date(meeting.scheduledTime)
    const end = addMinutes(start, meeting.duration)
    const occupiedSlots: Date[] = []

    const currentHour = new Date(start)
    currentHour.setMinutes(0, 0, 0)

    while (currentHour < end) {
      occupiedSlots.push(new Date(currentHour))
      currentHour.setHours(currentHour.getHours() + 1)
    }

    return occupiedSlots
  }

  const renderTimeSlot = (date: Date, hour: number, dayMeetings: TeamMeetingsType["meetings"]) => {
    const slotStart = new Date(date)
    slotStart.setHours(hour, 0, 0, 0)

    const slotEnd = new Date(date)
    slotEnd.setHours(hour + 1, 0, 0, 0)

    const meetingsInSlot = dayMeetings.filter((meeting) => {
      const meetingStart = new Date(meeting.scheduledTime)
      const meetingEnd = addMinutes(meetingStart, meeting.duration)
      return isBefore(meetingStart, slotEnd) && isAfter(meetingEnd, slotStart)
    })

    const occupiedHours = dayMeetings.flatMap(getOccupiedHourSlots)
    const isSlotOccupied = occupiedHours?.some((occupiedHour) => occupiedHour.getHours() === hour)

    return (
      <div key={hour} className="h-14 border-b border-neutral-700 relative group">
        {meetingsInSlot?.map((meeting) => {
          const meetingStart = new Date(meeting.scheduledTime)
          if (meetingStart.getHours() === hour) {
            const startMinutes = differenceInMinutes(meetingStart, slotStart)
            const height = (meeting.duration / 60) * 56 // 56px is the height of one hour slot

            return (
              <div
                key={meeting._id}
                className={`absolute left-1 right-1 bg-neutral-800 rounded-lg overflow-hidden border border-neutral-700 hover:bg-neutral-700 transition-colors hover:shadow-md ${
                  meeting.duration <= 30 ? "p-1 px-2" : "p-2"
                }`}
                style={{
                  top: `${Math.max(0, (startMinutes / 60) * 100)}%`,
                  height: `${Math.max(24, height)}px`,
                  minHeight: "24px",
                }}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-1">
                    <FaVideo className="text-blue-400 w-3 h-3" />
                    <span className={`text-xs font-medium text-white truncate ${meeting.duration <= 40 ? "max-w-[75px]" : ""}`}>{meeting.title}</span>
                    {meeting.duration <= 40 && (
                        <div className="text-[10px] text-neutral-400 mt-0.5">
                            {format(meetingStart, "h:mm a")} · {meeting.duration}m
                        </div>
                    )}
                  </div>
                  {meeting.duration > 40 && (
                    <div className="text-[10px] text-neutral-400 mt-0.5">
                        {format(meetingStart, "h:mm a")} · {meeting.duration}m
                    </div>
                  )}
                  {meeting.duration >= 75 && meeting.invitedParticipants && meeting.invitedParticipants.length > 0 && (
                    <div className="flex -space-x-2 mt-1">
                      {meeting.invitedParticipants.map((attendee, i) => (
                        <Avatar key={i} className="w-5 h-5 border-2 border-neutral-800">
                          <AvatarImage src={attendee.profilePicture} />
                          <AvatarFallback>{attendee.name[0]}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          }
          return null
        })}
        {!isSlotOccupied && (
          <div className="absolute inset-0 flex items-end p-2">
            <span className="text-xs text-neutral-500">{format(slotStart, "h:mm a")}</span>
          </div>
        )}
      </div>
    )
  }

  if (columns.length === 0) {
    return <div className="text-neutral-400">Loading...</div>
  }

  return (
    <div className="flex flex-col h-full bg-neutral-900">
      <div className="flex-1 overflow-x-auto custom-scrollbar">
        <div className="inline-flex">
          <div className="bg-neutral-900 pt-10">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="h-14 relative">
                <span className="absolute -left-14 top-0 text-xs text-neutral-500 w-12 text-right pr-2 py-1">
                  {format(new Date().setHours(i, 0, 0, 0), "h a")}
                </span>
              </div>
            ))}
          </div>
          <div
            className="inline-grid gap-0.5 bg-neutral-800"
            style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(200px, 1fr))` }}
          >
            {columns.map((date, index) => (
              <div
                key={index}
                className={cn(`bg-neutral-900 transition-colors`, columnColors[index % columnColors.length])}
              >
                <div className="h-10 p-2 text-center">
                  <div className="text-sm font-medium text-neutral-300">{format(date, "EEE")}</div>
                  <div className={`text-sm ${isSameDay(date, new Date()) ? "coppergroup-gradient-text font-semibold" : "text-neutral-400"}`}>
                    {format(date, "d")}
                  </div>
                </div>
                <div className="mt-5">
                  {Array.from({ length: 24 }, (_, i) => {
                    const dayMeetings = meetings.filter((meeting) => isSameDay(new Date(meeting.scheduledTime), date))
                    return renderTimeSlot(date, i, dayMeetings)
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function getColumnsForView(view: View, date: Date): Date[] {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  switch (view) {
    case "Day":
      return [startOfDay]
    case "Week":
      return eachDayOfInterval({
        start: startOfWeek(startOfDay),
        end: endOfWeek(startOfDay),
      })
    case "Month":
      const firstDayOfMonth = new Date(startOfDay.getFullYear(), startOfDay.getMonth(), 1)
      const lastDayOfMonth = new Date(startOfDay.getFullYear(), startOfDay.getMonth() + 1, 0)
      return eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth })
    case "Next week":
      const nextWeekStart = addDays(startOfWeek(startOfDay), 7)
      return eachDayOfInterval({
        start: nextWeekStart,
        end: addDays(nextWeekStart, 6),
      })
    default:
      return [new Date()]
  }
}

export default ScheduleGrid

