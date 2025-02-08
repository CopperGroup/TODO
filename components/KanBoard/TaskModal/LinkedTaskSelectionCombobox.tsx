'use client';

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
import { PopulatedTaskType } from "@/lib/types"

interface LinkedTaskSelectionComboboxProps {
  allTasks: PopulatedTaskType[]
  currentTaskId: string
  linkedTaskIds: string[]
  onTaskSelect: (taskId: string) => void
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
      !linkedTaskIds.includes(t._id)
  )

  return (
    <Combobox open={comboboxOpen} onOpenChange={setComboboxOpen}>
      <ComboboxTrigger className="w-full bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 border p-2 hover:bg-zinc-700/30 hover:text-gray-100">{linkedTaskInput || "Search for tasks..."}</ComboboxTrigger>
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
              onSelect={() => onTaskSelect(task._id)}
              className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <FiLink className="mr-2 h-4 w-4" />
              <span>{task.description}</span>
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export default LinkedTaskSelectionCombobox
