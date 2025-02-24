"use client"

import React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Wifi, Mic, Video } from 'lucide-react'
import { motion } from "framer-motion"
import { StreamVideoParticipant } from "@stream-io/video-react-sdk"

interface ParticipantListItemProps {
  participant: StreamVideoParticipant
  isCurrentParticipant: boolean
}

const ParticipantListItem: React.FC<ParticipantListItemProps> = ({ participant, isCurrentParticipant }) => {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-700/50 rounded-lg transition-colors">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold text-white">
          {participant.name?.[0] || "?"}
        </div>
        <span className="font-medium text-white">
          {participant.name || "Unknown"} {isCurrentParticipant && "(You)"}
        </span>
      </div>
      <div className="flex space-x-2">
        <Wifi className={`w-4 h-4 ${participant.connectionQuality === 3 ? 'text-green-500' : 'text-yellow-500'}`} />
        <Mic className={`w-4 h-4 ${participant.isSpeaking ? 'text-green-500' : 'text-gray-400'}`} />
        <Video className={`w-4 h-4 ${participant.videoStream? 'text-green-500' : 'text-gray-400'}`} />
      </div>
    </div>
  )
}

interface ParticipantListProps {
  participants: StreamVideoParticipant[]
  currentParticipant: StreamVideoParticipant
  isOpen: boolean
}

const ParticipantList: React.FC<ParticipantListProps> = ({ participants, currentParticipant, isOpen }) => {
  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: isOpen ? 320 : 0, opacity: isOpen ? 1 : 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="h-full bg-gray-800/90 shadow-lg backdrop-blur-md overflow-hidden"
    >
      <div className="p-4 h-full flex flex-col">
        <h2 className="text-xl font-semibold text-white mb-4">Participants ({participants.length})</h2>
        <ScrollArea className="flex-grow pr-4">
          <div className="space-y-2">
            {participants.map((participant) => (
              <ParticipantListItem
                key={participant.sessionId}
                participant={participant}
                isCurrentParticipant={participant.sessionId === currentParticipant.sessionId}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    </motion.div>
  )
}

export default ParticipantList
