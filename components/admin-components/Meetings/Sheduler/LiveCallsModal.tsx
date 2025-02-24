"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FaVideo } from "react-icons/fa"
import { XIcon, UserIcon } from "lucide-react"
import { format } from "date-fns"
import { TeamMeetingsType } from "@/lib/types"

interface LiveCallsModalProps {
  isOpen: boolean
  liveMeetings: TeamMeetingsType["meetings"]
  onClose: () => void
  onJoinCall: (meetingId: string) => void
}

export default function LiveCallsModal({ isOpen, liveMeetings, onClose, onJoinCall }: LiveCallsModalProps) {
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
      <div className="w-full max-w-md bg-neutral-800 text-white rounded-lg border border-neutral-700 shadow-xl max-h-[80vh] overflow-y-auto">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Live Calls</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-neutral-400 hover:text-white hover:bg-neutral-700 -mt-2 -mr-2"
            >
              <XIcon className="h-5 w-5" />
            </Button>
          </div>
          <div className="space-y-4">
            {liveMeetings.map((meeting) => (
              <div
                key={meeting._id}
                className="bg-neutral-700 rounded-lg overflow-hidden border border-neutral-600 hover:bg-neutral-600 transition-colors hover:shadow-md p-3"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <FaVideo className="text-blue-400 w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium text-white truncate">{meeting.title}</span>
                  </div>
                  <div className="text-xs text-neutral-400 mb-2">
                    {format(new Date(meeting.scheduledTime), "h:mm a")} · {meeting.duration}m
                  </div>
                  <div className="text-xs text-neutral-300 mb-2 line-clamp-2">{meeting.description}</div>
                  <div className="flex items-center space-x-2 mb-2">
                    <UserIcon className="w-3 h-3 text-neutral-400" />
                    <span className="text-xs text-neutral-300">Organizer:</span>
                    <div className="flex items-center space-x-1">
                      <Avatar className="w-4 h-4">
                        <AvatarImage src={meeting.author.profilePicture} />
                        <AvatarFallback>{meeting.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-neutral-300">{meeting.author.name}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex -space-x-2">
                      {meeting.invitedParticipants.slice(0, 3).map((attendee, i) => (
                        <Avatar key={i} className="w-6 h-6 border-2 border-neutral-700">
                          <AvatarImage src={attendee.profilePicture || ""} />
                          <AvatarFallback>{attendee.name[0]}</AvatarFallback>
                        </Avatar>
                      ))}
                      {meeting.invitedParticipants.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-neutral-600 flex items-center justify-center text-xs font-medium border-2 border-neutral-700">
                          +{meeting.invitedParticipants.length - 3}
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => onJoinCall(meeting._id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 h-7 px-3"
                    >
                      Join
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

