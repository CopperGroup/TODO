import { useCallStateHooks } from "@stream-io/video-react-sdk"
import { Video, VideoOff } from "lucide-react"

export const ToggleVideo = () => {
  const { useCameraState } = useCallStateHooks()
  const { camera, isMute } = useCameraState()
  return (
    <button
      onClick={() => camera.toggle()}
      className="p-3 rounded-full bg-neutral-700 text-white hover:bg-neutral-600 transition-colors"
    >
      {isMute ? <VideoOff size={15} /> : <Video size={15} />}
    </button>
  )
}

