"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUser } from "@clerk/nextjs"
import { useStreamVideoClient } from "@stream-io/video-react-sdk"
import { useRouter } from "next/navigation"
import { createMeeting } from "@/lib/actions/meeting.actions"
import type { MeetingType } from "@/lib/models/meeting.model"
import type { TeamMeetingsType, UserType } from "@/lib/types"
import { Calendar } from "@/components/ui/calendar-black"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Clock } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import UserSelectionCombobox from "./UserSelectionCombobox"
import { TimeSelect, TimeSelectContent, TimeSelectTrigger } from "@/components/ui/time-select-black"

interface AddMeetingModalProps {
  isOpen: boolean
  onClose: () => void
  team: TeamMeetingsType
}

const durations = [
  { value: "30", label: "30 min" },
  { value: "45", label: "45 min" },
  { value: "60", label: "60 min" },
  { value: "90", label: "90 min" },
  { value: "120", label: "2 hrs" },
  { value: "180", label: "3 hrs" },
]

export default function AddMeetingModal({ isOpen, onClose, team }: AddMeetingModalProps) {
  const [title, setTitle] = useState("")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [time, setTime] = useState("")
  const [duration, setDuration] = useState("60")
  const [description, setDescription] = useState("")
  const [invitedParticipants, setInvitedParticipants] = useState<UserType[]>([])
  const { user } = useUser()
  const client = useStreamVideoClient()
  const router = useRouter()

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
    }
    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])

  const createNewMeeting = async (e: React.FormEvent, isInstant = false) => {
    e.preventDefault()
    if (!client || !user) return

    try {
      let startsAt: Date
      if (isInstant) {
        startsAt = new Date()
        setTitle("Instant Meeting")
        setDescription("")
        setInvitedParticipants([])
        setDuration("60")
      } else {
        if (!date || !time) throw new Error("Date and time are required")
        startsAt = new Date(`${format(date, "yyyy-MM-dd")}T${time}`)
      }

      const result = await createMeeting(
        {
          title: isInstant ? "Instant Meeting" : title,
          description: isInstant ? "" : description,
          teamId: team._id,
          clerkId: user.id,
          scheduledTime: startsAt,
          duration: Number.parseInt(duration),
          invitedParticipants: isInstant ? [] : invitedParticipants.map((p) => p._id),
        },
        "json",
      )

      const newMeeting: MeetingType = JSON.parse(result)

      if (!newMeeting || !newMeeting._id) {
        throw new Error("Failed to retrieve meeting ID from backend")
      }

      const call = client.call("default", newMeeting._id)

      if (!call) throw new Error("Failed to create call")

      await call.getOrCreate({
        data: {
          starts_at: startsAt.toISOString(),
          custom: {
            title: isInstant ? "Instant Meeting" : title,
            description: isInstant ? "" : description,
            duration: Number.parseInt(duration),
          },
        },
      })

      router.push(`/dashboard/team/${team._id}/meetings/${call.id}`)
      onClose()
    } catch (error) {
      console.error("Error creating meeting:", error)
    }
  }

  const handleUserSelect = (user: UserType) => {
    setInvitedParticipants((prev) => [...prev, user])
  }

  const removeInvitedParticipant = (userId: string) => {
    setInvitedParticipants((prev) => prev.filter((p) => p._id !== userId))
  }

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
  };

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-neutral-800 rounded-lg p-6 w-full max-w-md text-white border border-neutral-700">
        <h2 className="text-2xl font-bold mb-4">Create New Meeting</h2>
        <form onSubmit={(e) => createNewMeeting(e, false)}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-neutral-300">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400"
              />
            </div>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="date" className="text-neutral-300">
                  Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      className={cn(
                        "w-full justify-start text-left font-normal bg-neutral-700 border-neutral-600 text-white hover:bg-neutral-700",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex-1">
              <Label htmlFor="time" className="text-neutral-300">
                Time
              </Label>
              <TimeSelect value={time} onSelect={handleTimeChange}>
                <TimeSelectTrigger className={`${time ? "text-white" : ""}`}>{time || "Select time..."}</TimeSelectTrigger>
                <TimeSelectContent />
              </TimeSelect>
              </div>
            </div>
            <div>
              <Label htmlFor="duration" className="text-neutral-300">
                Duration
              </Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="w-full bg-neutral-700 border-neutral-600 text-white">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                  {durations.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="hover:bg-neutral-700">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description" className="text-neutral-300">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400"
                rows={3}
              />
            </div>
            <div>
              <Label className="text-neutral-300">Invite Participants</Label>
              <UserSelectionCombobox team={team} assignees={invitedParticipants} onUserSelect={handleUserSelect} />
              <div className="mt-2 flex flex-wrap gap-2">
                {invitedParticipants.map((participant) => (
                  <div key={participant._id} className="flex items-center bg-neutral-700 rounded-full px-3 py-1">
                    <span>{participant.name}</span>
                    <button
                      type="button"
                      onClick={() => removeInvitedParticipant(participant._id)}
                      className="ml-2 text-neutral-400 hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-transparent border-white text-white hover:bg-white hover:text-black"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={(e) => createNewMeeting(e, true)}
              className="coppergroup-gradient-text bg-white"
            >
              Instant Meeting
            </Button>
            <Button type="submit" className="coppergroup-gradient text-white">
              Create Meeting
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

