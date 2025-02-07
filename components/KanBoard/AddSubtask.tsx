"use client"

import { useState } from "react"
import { FiPlus, FiUser } from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxEmpty,
} from "@/components/ui/combobox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TaskType } from "@/lib/models/task.model"
import { PopulatedTaskType, PopulatedTeamType } from "@/lib/types"

interface AddSubtaskProps {
  onSubtaskAdd: (newSubtask: PopulatedTaskType) => void
  parentTaskId: string
  team: PopulatedTeamType
}

const AddSubtask: React.FC<AddSubtaskProps> = ({ onSubtaskAdd, parentTaskId, team }) => {
  const [isAdding, setIsAdding] = useState(false)
  const [subtaskDescription, setSubtaskDescription] = useState("")
  const [subtaskType, setSubtaskType] = useState<"Issue" | "Bug">("Issue")
  const [assigneeInput, setAssigneeInput] = useState("")
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null)
  const [comboboxOpen, setComboboxOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subtaskDescription.trim()) return

    // const newSubtask = {
    //   _id: Date.now().toString(),
    //   description: subtaskDescription,
    //   parentId: parentTaskId,
    //   type: subtaskType,
    //   assignedTo: selectedAssignee ? [selectedAssignee] : [],
    //   team: team._id,
    //   // Add other required fields here
    // } as TaskT

    // onSubtaskAdd(newSubtask)
    setSubtaskDescription("")
    setSubtaskType("Issue")
    setSelectedAssignee(null)
    setIsAdding(false)
  }

  const filteredUsers = team.users.filter((user) => user.user.name.toLowerCase().includes(assigneeInput.toLowerCase()))

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  return (
    <div className="mt-4">
      {isAdding ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            value={subtaskDescription}
            onChange={(e) => setSubtaskDescription(e.target.value)}
            placeholder="Enter subtask description"
            className="bg-neutral-700 border-neutral-600 text-neutral-100"
          />
          <div className="flex gap-4">
            <Select value={subtaskType} onValueChange={(value: "Issue" | "Bug") => setSubtaskType(value)}>
              <SelectTrigger className="bg-neutral-700 border-neutral-600 text-neutral-100">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-100">
                <SelectItem value="Issue">Issue</SelectItem>
                <SelectItem value="Bug">Bug</SelectItem>
              </SelectContent>
            </Select>
            <Combobox open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <ComboboxTrigger className="w-full">{assigneeInput || "Assign to..."}</ComboboxTrigger>
              <ComboboxContent className="w-[400px] p-0">
                <ComboboxInput
                  placeholder="Search for members or enter email..."
                  value={assigneeInput}
                  onValueChange={setAssigneeInput}
                  className="w-full border-b p-2"
                />
                <ComboboxList className="max-h-[200px] overflow-y-auto">
                  {filteredUsers.length === 0 && !isValidEmail(assigneeInput) && (
                    <ComboboxEmpty>No members found.</ComboboxEmpty>
                  )}
                  {filteredUsers.map((user) => (
                    <ComboboxItem
                      key={user.user._id}
                      value={user.user._id}
                      onSelect={(value) => {
                        setSelectedAssignee(value)
                        setAssigneeInput(user.user.name)
                        setComboboxOpen(false)
                      }}
                      className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Avatar className="w-6 h-6 mr-2">
                        <AvatarImage src={user.user.profilePicture} alt={user.user.name} />
                        <AvatarFallback>{user.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{user.user.name}</span>
                      <span className="ml-auto text-sm text-gray-500">{user.user.email}</span>
                    </ComboboxItem>
                  ))}
                  {isValidEmail(assigneeInput) && !filteredUsers.some((user) => user.user.email === assigneeInput) && (
                    <ComboboxItem
                      value={assigneeInput}
                      onSelect={() => {
                        setSelectedAssignee(assigneeInput)
                        setComboboxOpen(false)
                      }}
                      className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <FiUser className="mr-2 h-4 w-4" />
                      <span>Invite &quot;{assigneeInput}&quot;</span>
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsAdding(false)}
              className="text-neutral-400 hover:text-neutral-100"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
              Add Subtask
            </Button>
          </div>
        </form>
      ) : (
        <Button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 text-neutral-400 hover:text-neutral-100"
        >
          <FiPlus /> Add Subtask
        </Button>
      )}
    </div>
  )
}

export default AddSubtask

