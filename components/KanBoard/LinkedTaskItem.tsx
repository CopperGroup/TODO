import { FiLink } from "react-icons/fi"
import { Badge } from "@/components/ui/badge"
import type { PopulatedTaskType } from "@/lib/types"
import type React from "react" // Added import for React

interface LinkedTaskItemProps {
  task: PopulatedTaskType
}

const LinkedTaskItem: React.FC<LinkedTaskItemProps> = ({ task }) => {
  return (
    <div className="flex items-center gap-3 bg-zinc-800/50 p-3 rounded-lg hover:bg-zinc-800 transition-colors">
      <FiLink className="text-zinc-400 flex-shrink-0" />
      <span className="flex-grow text-zinc-300 line-clamp-1">{task.description}</span>
      <Badge variant={task.type === "Bug" ? "destructive" : "default"} className="flex-shrink-0">
        {task.type}
      </Badge>
    </div>
  )
}

export default LinkedTaskItem

