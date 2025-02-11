"use client"

import { useState } from "react"
import { FiPlus, FiX } from "react-icons/fi"
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
import { Badge } from "@/components/ui/badge"
import type { PopulatedTaskType, PopulatedTeamType } from "@/lib/types"
import { createNewTaskSubtask } from "@/lib/actions/task.actions"

interface AddSubtaskProps {
  onSubtaskAdd: (newSubtask: PopulatedTaskType) => void
  parentTaskId: string
  team: PopulatedTeamType
  currentUser: { clerkId: string; email: string }
  parentTaskColumnId: string
  boardId: string
}

const AddSubtask: React.FC<AddSubtaskProps> = ({
  onSubtaskAdd,
  parentTaskId,
  team,
  currentUser,
  parentTaskColumnId,
  boardId,
}) => {
  const [isAdding, setIsAdding] = useState(false)
  const [subtaskDescription, setSubtaskDescription] = useState("")
  const [subtaskType, setSubtaskType] = useState<"Issue" | "Bug">("Issue")
  const [assigneeInput, setAssigneeInput] = useState("")
  const [selectedAssignees, setSelectedAssignees] = useState<
    { _id: string; name: string; email: string; profilePicture: string }[]
  >([])
  const [comboboxOpen, setComboboxOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subtaskDescription.trim()) return

    const result = await createNewTaskSubtask(
      {
        parentId: parentTaskId,
        clerkId: currentUser.clerkId,
        teamId: team._id,
        boardId,
        columnId: parentTaskColumnId,
        description: subtaskDescription,
        taskType: subtaskType,
        assigneesIds: selectedAssignees.map((as) => as._id),
      },
      "json",
    )

    setSubtaskDescription("")
    setSubtaskType("Issue")
    setSelectedAssignees([])
    setIsAdding(false)

    onSubtaskAdd(JSON.parse(result))
  }

  const filteredUsers = team.members.filter(
    (user) =>
      !selectedAssignees.some((assignee) => assignee._id === user.user._id) &&
      user.user.name.toLowerCase().includes(assigneeInput.toLowerCase()),
  )

  const handleAddAssignee = (assignee: { _id: string; name: string; email: string; profilePicture: string }) => {
    setSelectedAssignees([...selectedAssignees, assignee])
    setAssigneeInput("")
    setComboboxOpen(false)
  }

  const handleRemoveAssignee = (assigneeId: string) => {
    setSelectedAssignees(selectedAssignees.filter((assignee) => assignee._id !== assigneeId))
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
            className="bg-white border-gray-300 text-gray-900"
          />
          <div className="flex gap-4">
            <Select value={subtaskType} onValueChange={(value: "Issue" | "Bug") => setSubtaskType(value)}>
              <SelectTrigger className="w-24 h-7 px-2 text-xs bg-white text-gray-900 border-gray-300">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300 text-gray-900">
                <SelectItem value="Issue" className="focus:bg-gray-100 focus:text-gray-900">
                  <div className="w-full flex items-center gap-1">
                    <div className="w-[14px] h-[14px] bg-blue-500 rounded-sm" />
                    <span className="mb-0.5">Issue</span>
                  </div>
                </SelectItem>
                <SelectItem value="Bug" className="focus:bg-gray-100 focus:text-gray-900">
                  <div className="w-full flex items-center gap-1">
                    <div className="w-[14px] h-[14px] bg-red-500 rounded-sm" />
                    <span className="mb-0.5">Bug</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Combobox open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <ComboboxTrigger className="w-full h-7 text-xs bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 border p-2 hover:bg-gray-50 hover:text-gray-900">
                {assigneeInput || "Assign to..."}
              </ComboboxTrigger>
              <ComboboxContent className="w-full p-0">
                <ComboboxInput
                  placeholder="Search for members..."
                  value={assigneeInput}
                  onValueChange={setAssigneeInput}
                  className="w-full p-2"
                />
                <ComboboxList className="max-h-[200px] overflow-y-auto">
                  {filteredUsers.length === 0 && <ComboboxEmpty>No members found.</ComboboxEmpty>}
                  {filteredUsers.map((user) => (
                    <ComboboxItem
                      key={user.user._id}
                      value={user.user.name}
                      onSelect={() =>
                        handleAddAssignee({
                          _id: user.user._id,
                          name: user.user.name,
                          email: user.user.email,
                          profilePicture: user.user.profilePicture,
                        })
                      }
                      className="flex items-center p-2 hover:bg-gray-100"
                    >
                      <Avatar className="w-6 h-6 mr-2">
                        <AvatarImage src={user.user.profilePicture} alt={user.user.name} />
                        <AvatarFallback>{user.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-gray-900">{user.user.name}</span>
                      <span className="ml-auto text-xs text-gray-500">{user.user.email}</span>
                    </ComboboxItem>
                  ))}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
          {selectedAssignees.length > 0 && (
            <>
              <h4 className="font-medium text-gray-900">Assignees</h4>
              <div className="flex flex-wrap gap-2">
                {selectedAssignees.map((assignee) => (
                  <Badge
                    key={assignee._id}
                    variant="secondary"
                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 cursor-pointer"
                  >
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={assignee.profilePicture} />
                      <AvatarFallback>{assignee.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-gray-900">{assignee.name}</span>
                    <FiX
                      className="ml-1 text-gray-600 cursor-pointer"
                      onClick={() => handleRemoveAssignee(assignee._id)}
                    />
                  </Badge>
                ))}
              </div>
            </>
          )}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsAdding(false)}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-500 text-white hover:bg-blue-600">
              Add Subtask
            </Button>
          </div>
        </form>
      ) : (
        <Button
          variant="ghost"
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          <FiPlus /> Add Subtask
        </Button>
      )}
    </div>
  )
}

export default AddSubtask

