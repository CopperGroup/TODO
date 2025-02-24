"use client"

import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, ClockIcon, Users2Icon, UserIcon, MessageSquareIcon, XIcon } from "lucide-react"
import { useEffect } from "react"
import type { TeamMeetingsType } from "@/lib/types"

interface MeetingDetailsModalProps {
  isOpen: boolean
  meeting: TeamMeetingsType["meetings"][number]
  onClose: () => void
  onJoinMeeting: (meetingId: string) => void
}

export default function MeetingModal({ isOpen, meeting, onClose, onJoinMeeting }: MeetingDetailsModalProps) {
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-neutral-800 text-white rounded-lg border border-neutral-700 shadow-xl">
        <div className="p-4">
          <div className="flex justify-between items-start mb-3">
            <h2 className="text-xl font-bold">{meeting.title}</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-neutral-400 hover:text-white hover:bg-neutral-700 -mt-2 -mr-2"
            >
              <XIcon className="h-5 w-5" />
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-4 text-neutral-400 text-sm">
              <div className="flex items-center space-x-1">
                <CalendarIcon className="w-4 h-4" />
                <span>{format(new Date(meeting.scheduledTime), "MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center space-x-1">
                <ClockIcon className="w-4 h-4" />
                <span>
                  {format(new Date(meeting.scheduledTime), "h:mm a")} ({meeting.duration} min)
                </span>
              </div>
            </div>
            {meeting.description && (
              <div className="bg-neutral-700 bg-opacity-50 rounded p-3">
                <div className="flex items-start space-x-2 text-neutral-300 text-sm">
                  <MessageSquareIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p className="flex-1">{meeting.description}</p>
                </div>
              </div>
            )}
            <div className="space-y-3">
              <div>
                <div className="flex items-center space-x-1 text-neutral-400 mb-1 text-xs">
                  <UserIcon className="w-4 h-4" />
                  <span className="font-semibold">Organizer</span>
                </div>
                <div className="flex items-center space-x-2 py-1 px-2 text-sm">
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={meeting.author.profilePicture} />
                    <AvatarFallback>{meeting.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <span>{meeting.author.name}</span>
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-1 text-neutral-400 mb-1 text-xs">
                  <Users2Icon className="w-4 h-4" />
                  <span className="font-semibold">Invited Participants</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {meeting.invitedParticipants.map((participant) => (
                    <Badge
                      key={participant._id}
                      variant="secondary"
                      className="bg-neutral-700 bg-opacity-50 text-white hover:bg-neutral-600 text-xs py-0.5"
                    >
                      <Avatar className="w-4 h-4 mr-1">
                        <AvatarImage src={participant.profilePicture} />
                        <AvatarFallback>{participant.name[0]}</AvatarFallback>
                      </Avatar>
                      {participant.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-b-lg border-t border-neutral-700">
          <div className="flex justify-end">
            <Button
              onClick={() => onJoinMeeting(meeting._id)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 h-8"
            >
              Join Meeting
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

