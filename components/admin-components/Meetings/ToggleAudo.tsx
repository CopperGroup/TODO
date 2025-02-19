import { useCallStateHooks } from "@stream-io/video-react-sdk"
import { Mic, MicOff } from "lucide-react"

export const ToggleAudio = () => {
  const { useMicrophoneState } = useCallStateHooks()
  const { microphone, isMute } = useMicrophoneState()
  return (
    <button
      onClick={() => microphone.toggle()}
      className="p-3 rounded-full bg-neutral-700 text-white hover:bg-neutral-600 transition-colors"
    >
      {isMute ? <MicOff size={15} /> : <Mic size={15} />}
    </button>
  )
}

