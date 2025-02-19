"use client"

import { useState } from "react"
import {
  StreamTheme,
  ParticipantView,
  useCall,
  useCallStateHooks,
  CallingState,
  CallControls,
  CallStatsButton,
} from "@stream-io/video-react-sdk"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function VideoGrid() {
  const call = useCall()
  const { useCallCallingState, useParticipants } = useCallStateHooks()
  const callingState = useCallCallingState()
  const participants = useParticipants()
  const [page, setPage] = useState(0)
  const itemsPerPage = 6

  if (callingState !== CallingState.JOINED) {
    return (
      <Card className="p-8 max-w-md mx-auto mt-12">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Connecting to call...</h2>
          <p className="text-muted-foreground">Please wait while we establish the connection</p>
        </div>
      </Card>
    )
  }

  // Calculate pagination
  const startIndex = page * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPageParticipants = participants.slice(startIndex, endIndex)
  const totalPages = Math.ceil(participants.length / itemsPerPage)

  return (
    <StreamTheme>
      <div className="h-screen flex flex-col">
        <main className="flex-1 p-4 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full max-h-[calc(100vh-120px)]">
            {currentPageParticipants.map((participant) => (
              <div key={participant.sessionId} className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                <ParticipantView
                  participant={participant}
                  trackType={participant.screenShareTrack ? "screenShareTrack" : "videoTrack"}
                />
                <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm">
                  {participant.name || participant.sessionId}
                </div>
              </div>
            ))}
          </div>
        </main>

        <footer className="p-4 flex items-center justify-between bg-background border-t">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>
              Previous
            </Button>
            <span className="flex items-center px-3">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
            >
              Next
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <CallControls />
            <CallStatsButton />
          </div>
        </footer>
      </div>
    </StreamTheme>
  )
}

