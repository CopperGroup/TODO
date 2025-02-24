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
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl bg-neutral-900 text-white rounded-2xl shadow-2xl overflow-hidden relative">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0062ff" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#da61ff" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grad1)" />
          <path
            d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            fill="#0062ff"
            fillOpacity="0.1"
          >
            <animate
              attributeName="d"
              dur="20s"
              repeatCount="indefinite"
              values="M0,160L48,181.3C96,203,192,245,288,261.3C384,277,480,267,576,234.7C672,203,768,149,864,117.3C960,85,1056,75,1152,90.7C1248,107,1344,149,1392,170.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                      M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                      M0,160L48,181.3C96,203,192,245,288,261.3C384,277,480,267,576,234.7C672,203,768,149,864,117.3C960,85,1056,75,1152,90.7C1248,107,1344,149,1392,170.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;"
            />
          </path>
        </svg>
        <div className="relative p-6 pb-0">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 text-gray-400 hover:text-white hover:bg-neutral-800 rounded-full"
            onClick={onClose}
          >
            <XIcon className="h-6 w-6" />
          </Button>
          <h2 className="text-3xl font-bold mb-4 text-white">{meeting.title}</h2>
        </div>
        <div className="p-6 space-y-6 relative z-10">
          <div className="flex items-center space-x-4 text-gray-300">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-blue-400" />
              <span>{format(new Date(meeting.scheduledTime), "MMMM d, yyyy")}</span>
            </div>
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-5 h-5 text-blue-400" />
              <span>
                {format(new Date(meeting.scheduledTime), "h:mm a")} ({meeting.duration} min)
              </span>
            </div>
          </div>
          {meeting.description && (
            <div className="bg-neutral-800 bg-opacity-50 rounded-lg p-4">
                <div className="flex items-start space-x-3 text-gray-300">
                <MessageSquareIcon className="w-5 h-5 mt-1 text-blue-400" />
                <p className="flex-1">{meeting.description}</p>
                </div>
            </div>
          )}
          <div className="flex items-start space-x-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 text-gray-300 mb-2">
                <UserIcon className="w-5 h-5 text-blue-400" />
                <span className="font-semibold">Organizer</span>
              </div>
              <div className="flex items-center space-x-2 bg-neutral-800 bg-opacity-50 rounded-full py-1 px-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={meeting.author.profilePicture} />
                  <AvatarFallback>{meeting.author.name[0]}</AvatarFallback>
                </Avatar>
                <span>{meeting.author.name}</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 text-gray-300 mb-2">
                <Users2Icon className="w-5 h-5 text-blue-400" />
                <span className="font-semibold">Participants</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {meeting.invitedParticipants.map((participant) => (
                  <Badge
                    key={participant._id}
                    variant="secondary"
                    className="bg-neutral-800 bg-opacity-50 text-white hover:bg-neutral-700 transition-colors duration-200"
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
        <div className="p-6 bg-neutral-800 bg-opacity-50 relative z-10">
          <Button
            onClick={() => onJoinMeeting(meeting._id)}
            className="w-full coppergroup-gradient font-semibold text-white"
          >
            Join Meeting
          </Button>
        </div>
      </div>
    </div>
  )
}

