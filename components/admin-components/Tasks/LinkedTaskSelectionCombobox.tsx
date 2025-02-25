"use client"

import type React from "react"
import { useState } from "react"
import { FiLink } from "react-icons/fi"
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxEmpty,
} from "@/components/ui/combobox"
import type { TeamTasks } from "@/lib/types"

interface LinkedTaskSelectionComboboxProps {
  allTasks: TeamTasks['tasks']
  currentTaskId: string
  linkedTaskIds: string[]
  onTaskSelect: (task: {
    _id: string;
    description: string;
    type: string;
    location: "Board" | "Backlog";
    author: string;
    createdAt: Date;
    column: string;
    board: string;
    assignedTo: string[];
    parentId?: string;
  }) => void
}

const LinkedTaskSelectionCombobox: React.FC<LinkedTaskSelectionComboboxProps> = ({
  allTasks,
  currentTaskId,
  linkedTaskIds,
  onTaskSelect,
}) => {
  const [linkedTaskInput, setLinkedTaskInput] = useState("")
  const [comboboxOpen, setComboboxOpen] = useState(false)

  const filteredTasks = allTasks.filter(
    (t) =>
      t.description.toLowerCase().includes(linkedTaskInput.toLowerCase()) &&
      t._id !== currentTaskId &&
      !linkedTaskIds.includes(t._id) &&
      !t.parentId
  )

  return (
    <Combobox open={comboboxOpen} onOpenChange={setComboboxOpen}>
      <ComboboxTrigger className="w-full bg-white border-gray-300 text-gray-700 placeholder:text-gray-400 border p-2 hover:bg-gray-50 hover:text-gray-900">
        {linkedTaskInput || "Search for tasks..."}
      </ComboboxTrigger>
      <ComboboxContent className="w-full p-0">
        <ComboboxInput
          placeholder="Search for tasks..."
          value={linkedTaskInput}
          onValueChange={setLinkedTaskInput}
          className="w-full border-b p-2"
        />
        <ComboboxList className="max-h-[200px] overflow-y-auto">
          {filteredTasks.length === 0 && <ComboboxEmpty>No tasks found.</ComboboxEmpty>}
          {filteredTasks.map((task) => (
            <ComboboxItem
              key={task._id}
              value={task._id}
              onSelect={() => onTaskSelect({
                _id: task._id,
                description: task.description,
                type: task.type,
                location: task.location,
                author: task.author._id,
                createdAt: task.createdAt,
                column: task.column._id,
                board: task.board._id,
                assignedTo: task.assignedTo.map(a => a._id),
                parentId: task.parentId
              })}
              className="flex items-center p-2 hover:bg-gray-100"
            >
              <FiLink className="mr-2 h-4 w-4 text-gray-500" />
              <span className="text-gray-700">{task.description}</span>
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export default LinkedTaskSelectionCombobox