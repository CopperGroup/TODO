"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { type SetStateAction, useState } from "react"

const AddLabel = ({
  taskId,
  onLabelAdd,
  setIsAddingLabel,
}: {
  taskId: string
  onLabelAdd: (newLabel: string) => void
  setIsAddingLabel: React.Dispatch<SetStateAction<boolean>>
}) => {
  const [label, setLabel] = useState("")
  return (
    <div className="flex items-center gap-2">
      <Input
        type="text"
        placeholder="Enter label"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="h-[30px] text-sm flex-grow text-gray-900 bg-white border-gray-300 focus-visible:ring-blue-500"
      />
      <Button className="h-7" variant="outline" size="sm" onClick={() => onLabelAdd(label)}>
        Add
      </Button>
      <Button
        className="h-7 text-gray-600 bg-transparent hover:text-gray-900 hover:bg-gray-100"
        size="sm"
        variant="ghost"
        onClick={() => setIsAddingLabel(false)}
      >
        Cancel
      </Button>
    </div>
  )
}

export default AddLabel

