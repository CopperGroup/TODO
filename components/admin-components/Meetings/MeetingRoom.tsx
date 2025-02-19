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
  Icon,
  SfuModels,
  useParticipantViewContext,
} from "@stream-io/video-react-sdk"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Grid, Mic, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ToggleVideo } from "./ToggleVideo"
import { ToggleAudio } from "./ToggleAudo"

type LayoutType = "grid" | "speaker"

export default function VideoGrid() {
  const call = useCall()
  const { useCallCallingState, useParticipants, useDominantSpeaker, useMicrophoneState } = useCallStateHooks()
  const callingState = useCallCallingState()
  const participants = useParticipants()
  const dominantSpeaker = useDominantSpeaker()
  const [page, setPage] = useState(0)
  const [layout, setLayout] = useState<LayoutType>("grid")
  const itemsPerPage = layout === "grid" ? 6 : 4

  if (callingState !== CallingState.JOINED) {
    return (
      <Card className="p-8 max-w-md mx-auto mt-12 bg-neutral-800 text-white border-gray-700">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Connecting to call...</h2>
          <p className="text-neutral-400">Please wait while we establish the connection</p>
        </div>
      </Card>
    )
  }

  // Calculate pagination
  const startIndex = page * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPageParticipants = participants.slice(startIndex, endIndex)
  const totalPages = Math.ceil(participants.length / itemsPerPage)

  const speakerViewParticipants =
    layout === "speaker" ? [dominantSpeaker, ...participants.filter((p) => p !== dominantSpeaker)] : participants

  return (
    <StreamTheme>
      <div className="flex flex-col bg-neutral-900 text-white h-screen">
        <main className="flex-1 p-4 overflow-hidden relative">
          {layout === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
              {currentPageParticipants.map((participant) => (
                <ParticipantTile key={participant.sessionId} participant={participant} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="h-1/4 mb-4">
                <div className="flex gap-2 h-full">
                  {speakerViewParticipants.slice(1, 5).map((participant) => (
                    <div key={participant?.sessionId} className="w-1/4 flex-shrink-0">
                      <ParticipantTile participant={participant} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <ParticipantTile participant={speakerViewParticipants[0]} isSpeaker />
              </div>
            </div>
          )}

          {/* Page switching controls */}
          <div className="absolute top-1/2 left-0 right-0 flex justify-between px-4 -translate-y-1/2 pointer-events-none">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className={`p-2 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 transition-colors pointer-events-auto ${page === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className={`p-2 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 transition-colors pointer-events-auto ${page >= totalPages - 1 ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </main>

        {/* Control panel */}
        <div className="max-h-16 flex justify-center mb-4">
          <div className="flex items-center gap-2 bg-neutral-800 rounded-full p-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLayout("grid")}
              className={`text-white rounded-full ${layout === "grid" ? "bg-neutral-700" : ""}`}
            >
              <Grid size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLayout("speaker")}
              className={`text-white rounded-full ${layout === "speaker" ? "bg-neutral-700" : ""}`}
            >
              <Users size={20} />
            </Button>
            <ToggleAudio />
            <ToggleVideo />
            <CallControls />
            <CallStatsButton />
          </div>
        </div>
      </div>
    </StreamTheme>
  )
}

const ParticipantTile = ({ participant, isSpeaker = false }: { participant: any; isSpeaker?: boolean }) => (
  <div className={`relative aspect-video bg-neutral-800 rounded-lg overflow-hidden ${isSpeaker ? "h-full" : ""}`}>
    <AudioVolumeIndicator />
    <ParticipantView
      participant={participant}
      trackType={participant.screenShareTrack ? "screenShareTrack" : "videoTrack"}
      VideoPlaceholder={CustomVideoPlaceholder}
      ParticipantViewUI={CustomParticipantViewUI}
    />
  </div>
)

const CustomVideoPlaceholder = ({ style }: { style: React.CSSProperties }) => {
  const { participant } = useParticipantViewContext()

  return (
    <div className="flex items-center justify-center w-full h-full bg-neutral-700" style={style}>
      {participant.image ? (
        <img src={participant.image || "/placeholder.svg"} alt={participant.id} className="w-24 h-24 rounded-full" />
      ) : (
        <div className="w-24 h-24 rounded-full bg-neutral-600 flex items-center justify-center text-2xl font-bold">
          {participant.name?.[0]}
        </div>
      )}
    </div>
  )
}

const CustomParticipantViewUI = () => {
  const { participant } = useParticipantViewContext()

  return (

    <div className="absolute bottom-2 left-2 right-2 bg-black/50 px-2 py-1 rounded text-white text-sm">
      <div className="w-full flex justify-between items-center">
        <span>{participant.name}</span>
        <MyNetworkQualityIndicator />
      </div>
    </div>
  )
}

const MyNetworkQualityIndicator = () => {
  const { participant } = useParticipantViewContext()

  const readableConnectionQuality = SfuModels.ConnectionQuality[participant.connectionQuality]

  return (
    <span title={readableConnectionQuality} className="text-yellow-400">
      {"⭐️".repeat(participant.connectionQuality)}
    </span>
  )
}

const AudioVolumeIndicator = () => {
  const { useMicrophoneState } = useCallStateHooks()
  const { isEnabled, mediaStream } = useMicrophoneState()
  const [audioLevel, setAudioLevel] = useState(0)

  useEffect(() => {
    if (!isEnabled || !mediaStream) return

    const disposeSoundDetector = createSoundDetector(mediaStream, ({ audioLevel: al }) => setAudioLevel(al), {
      detectionFrequencyInMs: 80,
      destroyStreamOnStop: false,
    })

    return () => {
      disposeSoundDetector().catch(console.error)
    }
  }, [isEnabled, mediaStream])

  if (!isEnabled) return null

  return (
    <div className="absolute w-full h-full flex text-neutral-600/30">
      <div className="w-fit h-3/5 flex flex-col justify-end items-center gap-1 ">
        <div className="w-1 h-2/6 bg-neutral-600/30 flex items-end rounded-full">
            <div
            className="bg-blue-500 w-full rounded-full transition-all duration-100"
            style={{ height: `${audioLevel}%` }}
            />
        </div>
        <Mic className="w-4 h-4"/>
      </div>
    </div>
  )
}

