import type React from "react"
import { FiLink, FiX } from "react-icons/fi"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { TeamTasks } from "@/lib/types"

interface LinkedTaskItemProps {
  task: TeamTasks['tasks'][number]['linkedTasks'][number]
  handleUnlinkTask: (taskId: string) => void
}

const LinkedTaskItem: React.FC<LinkedTaskItemProps> = ({ task, handleUnlinkTask }) => {
  return (
    <div className="flex items-center gap-3 bg-gray-50 px-3 py-0.5 rounded-lg hover:bg-gray-100 transition-colors">
      <FiLink className="text-gray-400 flex-shrink-0" />
      <span className="flex-grow text-sm text-gray-700 line-clamp-1">{task.description}</span>
      <Badge className={`${task.type === "Bug" ? "bg-red-100 text-red-800 hover:bg-red-200" : "bg-blue-100 text-blue-800 hover:bg-blue-200"} text-center`}>
        {task.type}
      </Badge>
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-500 p-0 hover:text-gray-700 hover:bg-transparent"
        onClick={() => handleUnlinkTask(task._id)}
      >
        <FiX />
      </Button>
    </div>
  )
}

export default LinkedTaskItem