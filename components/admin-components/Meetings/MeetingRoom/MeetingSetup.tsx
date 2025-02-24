"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { VideoPreview, useCall, useCallStateHooks } from "@stream-io/video-react-sdk"
import { Card, CardContent } from "@/components/ui/card"
import { Toggle } from "@/components/ui/toggle"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Mic, Video, VideoOff, MicOff, Users, Settings, ChevronRight, ChevronLeft } from 'lucide-react'

interface Device {
  deviceId: string
  label: string
}

interface DeviceSelectorProps {
  devices: Device[]
  selectedDeviceId: string | undefined
  onSelect: (deviceId: string) => void
}

const DeviceSelector: React.FC<DeviceSelectorProps> = ({ devices, selectedDeviceId, onSelect }) => (
  <Select value={selectedDeviceId} onValueChange={onSelect}>
    <SelectTrigger className="w-full bg-white text-gray-800 border-gray-200 rounded-md">
      <SelectValue placeholder="Select Device" />
    </SelectTrigger>
    <SelectContent className="bg-white text-gray-800 border-gray-200 rounded-md">
      {devices.map((device) => (
        <SelectItem key={device.deviceId} value={device.deviceId} className="hover:bg-gray-100">
          {device.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)

const AudioInputDeviceSelector: React.FC = () => {
  const { useMicrophoneState } = useCallStateHooks()
  const { microphone, devices, selectedDevice } = useMicrophoneState()

  return (
    <DeviceSelector
      devices={devices || []}
      selectedDeviceId={selectedDevice}
      onSelect={(deviceId) => microphone.select(deviceId)}
    />
  )
}

const VideoInputDeviceSelector: React.FC = () => {
  const { useCameraState } = useCallStateHooks()
  const { camera, devices, selectedDevice } = useCameraState()

  return (
    <DeviceSelector
      devices={devices || []}
      selectedDeviceId={selectedDevice}
      onSelect={(deviceId) => camera.select(deviceId)}
    />
  )
}

interface MeetingSetupProps {
  setIsSetUpComplete: (isComplete: boolean) => void
}

const MeetingSetup: React.FC<MeetingSetupProps> = ({ setIsSetUpComplete }) => {
  const [isMicOn, setIsMicOn] = useState(true)
  const [isCamOn, setIsCamOn] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const call = useCall()

  if (!call) {
    throw new Error("useCall() must be used within StreamCall component")
  }

  useEffect(() => {
    if (isMicOn) {
      call.microphone.enable()
    } else {
      call.microphone.disable()
    }
    if (isCamOn) {
      call.camera.enable()
    } else {
      call.camera.disable()
    }
  }, [isMicOn, isCamOn, call])

  return (
    <div className="w-full h-screen flex justify-center items-center bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800">
      <Card className="p-6 max-w-4xl w-full bg-white rounded-lg shadow-lg border border-gray-200 flex">
        <CardContent className="flex-1">
          <div className="relative mb-6">
            {isCamOn ? (
              <VideoPreview className="rounded-lg overflow-hidden shadow-md" />
            ) : (
              <div className="rounded-lg overflow-hidden shadow-md bg-gray-200 aspect-video flex items-center justify-center">
                <p className="text-gray-600 font-medium">Video is off</p>
              </div>
            )}
            <div className="absolute bottom-4 left-4 right-4 flex justify-center items-center gap-4">
              <Toggle
                pressed={isMicOn}
                onPressedChange={setIsMicOn}
                className="bg-white bg-opacity-90 text-black hover:bg-gray-100 data-[state=on]:bg-gray-100/20 data-[state=on]:text-white rounded-full p-2 shadow-sm"
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </Toggle>
              <Toggle
                pressed={isCamOn}
                onPressedChange={setIsCamOn}
                className="bg-white bg-opacity-90 text-black hover:bg-gray-100 data-[state=on]:bg-gray-100/20 data-[state=on]:text-white rounded-full p-2 shadow-sm"
              >
                {isCamOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </Toggle>
            </div>
          </div>
          <Button
            className="w-full coppergroup-gradient text-white font-semibold py-3 rounded-md transition-all duration-300 ease-in-out flex items-center justify-center gap-2 text-base shadow-sm"
            onClick={() => {
              call.join()
              setIsSetUpComplete(true)
            }}
          >
            <Users className="w-5 h-5" />
            Join Meeting
          </Button>
        </CardContent>

        <div
          className={`flex flex-col justify-between border-l border-gray-200 transition-all duration-300 ease-in-out overflow-hidden ${showSettings ? "w-80 px-6" : "w-0"}`}
        >
          <div className="space-y-5 py-6">
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Microphone</label>
              <AudioInputDeviceSelector />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Camera</label>
              <VideoInputDeviceSelector />
            </div>
          </div>
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          className="self-center text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md ml-2" 
          onClick={() => setShowSettings(!showSettings)}
        >
          {showSettings ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </Button>
      </Card>
    </div>
  )
}

export default MeetingSetup