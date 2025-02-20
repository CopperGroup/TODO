"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  StreamTheme,
  ParticipantView,
  useCall,
  useCallStateHooks,
  CallingState,
  CallControls,
  CallStatsButton,
  createSoundDetector,
  SfuModels,
  useParticipantViewContext,
} from "@stream-io/video-react-sdk"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, LayoutGrid, Users, PhoneOff, PhoneIcon as PhoneX, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { ToggleAudio } from "./ToggleAudio"
import { ToggleVideo } from "./ToggleVideo"

type LayoutType = "grid" | "speaker"

export default function VideoGrid() {
  const call = useCall()
  const { useCallCallingState, useParticipants, useDominantSpeaker } = useCallStateHooks()
  const callingState = useCallCallingState()
  const participants = useParticipants()
  const dominantSpeaker = useDominantSpeaker()
  const [page, setPage] = useState(0)
  const [layout, setLayout] = useState<LayoutType>("grid")
  const itemsPerPage = layout === "grid" ? 9 : 5

  if (callingState !== CallingState.JOINED) {
    return (
      <Card className="p-8 max-w-md mx-auto mt-12 bg-black/40 text-white border-none shadow-lg backdrop-blur-lg rounded-2xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Connecting to call...
          </h2>
          <p className="text-neutral-300">Please wait while we establish the connection</p>
        </div>
      </Card>
    )
  }

  const startIndex = page * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPageParticipants = participants.slice(startIndex, endIndex)
  const totalPages = Math.ceil(participants.length / itemsPerPage)

  const speakerViewParticipants =
  layout === "speaker" && dominantSpeaker
    ? [dominantSpeaker, ...participants.filter((p) => p !== dominantSpeaker)]
    : participants;


  const handleLeaveCall = () => {
    call?.leave()
  }

  const handleEndCall = () => {
    call?.endCall()
  }

  return (
    <StreamTheme>
      <div className="relative flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white min-h-screen">
        <main className="flex-1 p-6 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {layout === "grid" ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto"
              >
                {currentPageParticipants.map((participant) => (
                  <ParticipantTile key={participant.sessionId} participant={participant} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="speaker"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="h-[90vh]"
              >
                <div className="h-full flex gap-4">
                  {speakerViewParticipants[0] && (
                    <div className="h-full flex-1">
                      <ParticipantTile participant={speakerViewParticipants[0]} isSpeaker />
                    </div>
                  )}
                  <div className="h-fit w-1/6 grid grid-cols-1 gap-2">
                    {speakerViewParticipants.slice(1, 5).map((participant) => (
                      <div key={participant?.sessionId} className="flex-1">
                        <ParticipantTile participant={participant} />
                      </div>
                    ))}
                  </div>
                </div>
                <div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Page switching controls */}
          <div className="absolute top-1/2 left-0 right-0 flex justify-between px-4 -translate-y-1/2 pointer-events-none">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors pointer-events-auto backdrop-blur-sm"
            >
              <ChevronLeft size={24} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors pointer-events-auto backdrop-blur-sm"
            >
              <ChevronRight size={24} />
            </Button>
          </div>
        </main>

        {/* Control panel */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="max-h-12 fixed bottom-6 left-1/2 transform -translate-x-1/2 flex justify-center"
        >
          <div className="w-full flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-full p-2 shadow-lg">
            <ControlButton
              onClick={() => setLayout("grid")}
              active={layout === "grid"}
              icon={<LayoutGrid size={20} />}
            />
            <ControlButton
              onClick={() => setLayout("speaker")}
              active={layout === "speaker"}
              icon={<Users size={20} />}
            />
            <ToggleAudio />
            <ToggleVideo />
            <CallControls />
            <CallStatsButton />
            <ControlButton
              onClick={handleLeaveCall}
              className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
              icon={<PhoneOff size={20} />}
            />
            <ControlButton
              onClick={handleEndCall}
              className="bg-red-500 hover:bg-red-600"
              icon={<PhoneX size={20} />}
            />
          </div>
        </motion.div>
      </div>
    </StreamTheme>
  )
}

const ParticipantTile = ({ participant, isSpeaker = false }: { participant: any; isSpeaker?: boolean }) => (
  <motion.div
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: "spring", stiffness: 260, damping: 20 }}
    className={`relative aspect-video bg-gray-800 rounded-xl overflow-hidden shadow-lg ${
      isSpeaker ? "ring-2 ring-blue-500 ring-offset-4 ring-offset-gray-900" : ""
    }`}
  >
    <AudioVolumeIndicator participant={participant} />
    <ParticipantView
      participant={participant}
      trackType="videoTrack"
      VideoPlaceholder={CustomVideoPlaceholder}
      ParticipantViewUI={CustomParticipantViewUI}
      className="h-full"
    />
  </motion.div>
)

const CustomVideoPlaceholder = ({ style }: { style: React.CSSProperties }) => {
  const context = useParticipantViewContext()
  const participant = context?.participant

  if (!participant) return null // Prevent rendering if participant is undefined

  return (
    <div
      className="flex items-center justify-center w-full h-full bg-gradient-to-br from-gray-700 to-gray-900"
      style={style}
    >
      {participant.image ? (
        <img
          src={participant.image || "/placeholder.svg"}
          alt={participant.id}
          className="w-24 h-24 rounded-full border-2 border-white/20"
        />
      ) : (
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold">
          {participant.name?.[0] || "?"}
        </div>
      )}
    </div>
  )
}

const CustomParticipantViewUI = () => {
  const context = useParticipantViewContext()
  const participant = context?.participant

  if (!participant) return null // Ensure the participant exists

  return (
    <div className="absolute bottom-2 left-2 right-2 px-3 py-2 rounded-lg text-white text-sm">
      <div className="w-full flex justify-between items-center">
        <span className="font-medium">{participant.name || "Unknown"}</span>
      </div>
    </div>
  )
}


const AudioVolumeIndicator = ({ participant }: { participant: any }) => {
  const { useMicrophoneState } = useCallStateHooks()
  const { isEnabled } = useMicrophoneState()
  const [audioLevel, setAudioLevel] = useState(0)

  useEffect(() => {
    if (!isEnabled || !participant.audioTrack) return

    const disposeSoundDetector = createSoundDetector(
      participant.audioTrack,
      ({ audioLevel: al }) => setAudioLevel(al),
      {
        detectionFrequencyInMs: 80,
        destroyStreamOnStop: false,
      },
    )

    return () => {
      disposeSoundDetector().catch(console.error)
    }
  }, [isEnabled, participant])

  if (!isEnabled) return null

  return (
    <div className="absolute left-2 top-2 w-6 h-16 flex flex-col justify-end items-center gap-1 bg-black/40 rounded-full p-1 backdrop-blur-sm">
      <div className="w-1 h-full bg-gray-600/30 flex items-end rounded-full overflow-hidden">
        <motion.div
          className="bg-blue-500 w-full rounded-full"
          initial={{ height: "0%" }}
          animate={{ height: `${audioLevel}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>
      <Volume2 className="w-4 h-4 text-blue-400" />
    </div>
  )
}

const ControlButton = ({
  onClick,
  active,
  className,
  icon,
}: { onClick: () => void; active?: boolean; className?: string; icon: React.ReactNode }) => (
  <Button
    variant="ghost"
    size="icon"
    onClick={onClick}
    className={`text-white rounded-full transition-all duration-200 hover:text-white ${
      active ? "coppergroup-gradient text-white" : "hover:bg-white/10"
    } ${className}`}
  >
    {icon}
  </Button>
)

