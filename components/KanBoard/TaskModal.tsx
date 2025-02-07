"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { format } from "date-fns"
import { FiPaperclip, FiClock, FiEdit2, FiCheck, FiX } from "react-icons/fi"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import type { PopulatedTaskType, PopulatedTeamType } from "@/lib/types"
import CommentField from "./CommentField"
import UserSelectionCombobox from "./UserSelectionCombobox"
import LinkedTaskSelectionCombobox from "./LinkedTaskSelectionCombobox"
import AddSubtask from "./AddSubtask"
import LinkedTaskItem from "./LinkedTaskItem"

interface TaskModalProps {
  task: PopulatedTaskType
  isOpen: boolean
  onClose: () => void
  onUpdate: (updatedTask: PopulatedTaskType) => void
  team: PopulatedTeamType
  allTasks: PopulatedTaskType[]
}

const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, onClose, onUpdate, team, allTasks }) => {
  const [localTask, setLocalTask] = useState<PopulatedTaskType>(task)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [description, setDescription] = useState(task.description || "")
  const [editedDescription, setEditedDescription] = useState(description)
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setModalRoot(document.body)
  }, [])

  const handleDescriptionSave = () => {
    setDescription(editedDescription)
    setLocalTask((prev) => ({ ...prev, description: editedDescription }))
    setIsEditingDescription(false)
    onUpdate({ ...localTask, description: editedDescription })
  }

  const handleDescriptionCancel = () => {
    setEditedDescription(description)
    setIsEditingDescription(false)
  }

  const handleLinkedTaskAdd = (taskId: string) => {
    const linkedTask = allTasks.find((t) => t._id === taskId)
    if (linkedTask && !localTask.linkedTasks.find((lt) => lt._id === taskId)) {
      setLocalTask((prev) => ({
        ...prev,
        linkedTasks: [...prev.linkedTasks, linkedTask],
      }))
    }
  }

  const handleSubtaskAdd = (newSubtask: PopulatedTaskType) => {
    setLocalTask((prevTask) => ({
      ...prevTask,
      subTasks: [...prevTask.subTasks, newSubtask],
    }))
    onUpdate(localTask)
  }

  const handleCommentAdd = (newComment: string) => {
    const comment = {
      _id: Date.now().toString(),
      content: newComment,
      author: { _id: "current-user", name: "Current User", profilePicture: "", email: "user@example.com" },
      task: localTask._id as unknown as PopulatedTaskType,
      attachments: [],
      createdAt: new Date(),
    }

    setLocalTask((prevTask) => ({
      ...prevTask,
      comments: [...prevTask.comments, comment],
    }))
    onUpdate(localTask)
  }

  if (!isOpen || !modalRoot) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col custom-scrollbar">
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <Badge variant={task.type === "Bug" ? "destructive" : "default"} className="mb-2">
                {task.type}
              </Badge>
              <h2 className="text-xl lg:text-2xl font-semibold text-zinc-100">{localTask.description}</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <FiX className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden custom-scrollbar">
          {/* Left Column */}
          <ScrollArea className="custom-scrollbar flex-1 border-r border-zinc-800">
            <div className="p-4 lg:p-6 space-y-6">
              <div className="flex items-center justify-between text-sm text-zinc-400 bg-zinc-800/50 p-3 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <FiClock className="w-4 h-4" />
                    <span>Created {format(new Date(localTask.createdAt), "PPp")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={localTask.author.profilePicture} />
                    <AvatarFallback>{localTask.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <span>{localTask.author.name}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-zinc-100">Description</h3>
                  {!isEditingDescription && (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditingDescription(true)}>
                      <FiEdit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
                {isEditingDescription ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      className="h-24 bg-zinc-800/50 border-zinc-700 resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={handleDescriptionCancel}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleDescriptionSave}>
                        <FiCheck className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-zinc dark:prose-invert max-w-none bg-zinc-800/50 rounded-lg p-3">
                    <p className="text-zinc-300">{description || "No description provided."}</p>
                  </div>
                )}
              </div>

              <Separator className="bg-zinc-800" />

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-zinc-100">Linked Tasks</h3>
                <div className="space-y-2">
                  {localTask.linkedTasks.map((linkedTask) => (
                    <LinkedTaskItem key={linkedTask._id} task={linkedTask} />
                  ))}
                </div>
                <LinkedTaskSelectionCombobox
                  allTasks={allTasks}
                  currentTaskId={localTask._id}
                  linkedTaskIds={localTask.linkedTasks.map((lt) => lt._id)}
                  onTaskSelect={handleLinkedTaskAdd}
                />
              </div>

              <Separator className="bg-zinc-800" />

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-zinc-100">Subtasks</h3>
                <div className="space-y-2">
                  {localTask.subTasks.length > 0 ? (
                    localTask.subTasks.map((subtask) => (
                      <div key={subtask._id} className="flex items-center gap-2 p-3 rounded-lg bg-zinc-800/50">
                        <input type="checkbox" className="rounded bg-zinc-700 border-zinc-600" />
                        <span className="text-zinc-300">{subtask.description}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-zinc-500 italic">No subtasks yet</p>
                  )}
                </div>
                <AddSubtask onSubtaskAdd={handleSubtaskAdd} parentTaskId={localTask._id} team={team} />
              </div>

              <Separator className="bg-zinc-800" />

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-zinc-100">Attachments</h3>
                <div className="space-y-2">
                  {localTask.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-zinc-800/50">
                      <FiPaperclip className="text-zinc-400" />
                      <span className="text-zinc-300">{attachment}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Right Column */}
          <ScrollArea className="w-80 lg:w-96 flex-shrink-0">
            <div className="p-4 lg:p-6 space-y-6">
              <div className="space-y-3">
                <h4 className="font-medium text-zinc-100">Assignees</h4>
                <div className="flex flex-wrap gap-2">
                  {localTask.assignedTo.map((assignee) => (
                    <Badge
                      key={assignee._id}
                      variant="secondary"
                      className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700"
                    >
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={assignee.profilePicture} />
                        <AvatarFallback>{assignee.name[0]}</AvatarFallback>
                      </Avatar>
                      <span>{assignee.name}</span>
                    </Badge>
                  ))}
                </div>
                <UserSelectionCombobox team={team} onUserSelect={() => {}} />
              </div>

              <Separator className="bg-zinc-800" />

              <div className="space-y-3">
                <h4 className="font-medium text-zinc-100">Comments</h4>
                <div className="space-y-4 mb-4">
                  {localTask.comments.map((comment, index) => (
                    <div key={index} className="flex gap-3 p-3 rounded-lg bg-zinc-800/50">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-zinc-100">{comment.author.name}</span>
                          <span className="text-xs text-zinc-500">{format(new Date(comment.createdAt), "PPp")}</span>
                        </div>
                        <p className="text-sm text-zinc-300">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <CommentField onCommentAdd={handleCommentAdd} taskId={localTask._id} />
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>,
    modalRoot,
  )
}

export default TaskModal

