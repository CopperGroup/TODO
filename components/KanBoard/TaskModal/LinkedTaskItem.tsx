import { FiLink, FiX } from "react-icons/fi"
import { Badge } from "@/components/ui/badge"
import type { PopulatedTaskType } from "@/lib/types"
import type React from "react" // Added import for React
import { Button } from "@/components/ui/button"

interface LinkedTaskItemProps {
  task: PopulatedTaskType,
  handleUnlinkTask: (taskId: string) => void
}

const LinkedTaskItem: React.FC<LinkedTaskItemProps> = ({ task, handleUnlinkTask }) => {
  return (
    <div className="flex items-center gap-3 bg-zinc-800/50 px-3 py-0.5 rounded-lg hover:bg-zinc-800 transition-colors">
      <FiLink className="text-zinc-400 flex-shrink-0" />
      <span className="flex-grow text-sm text-zinc-300 line-clamp-1">{task.description}</span>
      <Badge
      className={`${
          task.type === "Bug" ? "bg-red-500 hover:bg-red-600" : "bg-neutral-500 hover:bg-neutral-400"
        } text-center`}
      >
        {task.type}
      </Badge>
      <Button variant="ghost" size="sm" className="text-zinc-300 p-0 hover:text-zinc-100 hover:bg-transparent" onClick={() => handleUnlinkTask(task._id)}>
        <FiX/>
      </Button>
    </div>
  )
}

export default LinkedTaskItem

