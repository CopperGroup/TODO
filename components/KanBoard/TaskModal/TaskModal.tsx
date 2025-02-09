"use client"

import { useEffect, useState, useRef } from "react"
import { createPortal } from "react-dom"
import { format } from "date-fns"
import { FiPaperclip, FiClock, FiEdit2, FiCheck, FiX, FiPlus } from "react-icons/fi"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import type { PopulatedColumnType, PopulatedTaskType, PopulatedTeamType } from "@/lib/types"
import CommentField from "./CommentField"
import UserSelectionCombobox from "./UserSelectionCombobox"
import AddSubtask from "./AddSubtask"
import LinkedTaskItem from "./LinkedTaskItem"
import AddLabel from "./AddLabel"
import LinkedTaskSelectionCombobox from "./LinkedTaskSelectionCombobox"
import TaskAttachments from "./TaskAttachments"
import { addAttachmentsToTask, assignTask, linkTasks, removeAttachmentsFromTask, updateTaskColumn, updateTaskDescription, updateTaskLabels } from "@/lib/actions/task.actions"
import SubtaskList from "./SubTaskList"
import { createComment } from "@/lib/actions/comment.actions"

interface TaskModalProps {
  task: PopulatedTaskType
  isOpen: boolean
  onClose: () => void
  onUpdate: (updatedTask: PopulatedTaskType) => void
  team: PopulatedTeamType
  allTasks: PopulatedTaskType[],
  currentUser: { clerkId: string, email: string },
  columns: PopulatedColumnType[],
}

const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, onClose, onUpdate, team, allTasks, currentUser, columns }) => {
  const [localTask, setLocalTask] = useState<PopulatedTaskType>(task)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [description, setDescription] = useState(task.description || "")
  const [editedDescription, setEditedDescription] = useState(description)
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null)
  const [isAddingLabel, setIsAddingLabel] = useState(false)
  const [subTaskAccorditionValue, setSubTaskAccorditionValue] = useState("subtasks")

  useEffect(() => {
    setModalRoot(document.body)
  }, [])

  const handleDescriptionSave = async () => {
    setDescription(editedDescription)
    setLocalTask((prev) => ({ ...prev, description: editedDescription }))
    setIsEditingDescription(false)
    onUpdate({ ...localTask, description: editedDescription })
    await updateTaskDescription({ taskId: task._id, prevDescription: task.description, newDescription: editedDescription}, 'json')
  }

  const handleDescriptionCancel = () => {
    setEditedDescription(description)
    setIsEditingDescription(false)
  }

  const handleLinkedTaskAdd = async (taskId: string) => {
    const linkedTask = allTasks.find((t) => t._id === taskId)
    if (linkedTask && !localTask.linkedTasks.find((lt) => lt._id === taskId)) {
      setLocalTask((prev) => ({
        ...prev,
        linkedTasks: [...prev.linkedTasks, linkedTask],
      }))

      try {
        const updatedIds = [...localTask.linkedTasks.map((t) => t._id), linkedTask._id];
        await linkTasks({ taskId: task._id, linkedTasksIds: updatedIds, operation: "Push" });
      } catch (error) {
        console.error("Failed to link task:", error);
      }
    }
  }

  const handleUnlinkTask = async (taskId: string) => {
    setLocalTask((prev) => ({
      ...prev,
      linkedTasks: [...prev.linkedTasks.filter(task => task._id !== taskId)],
    }))

    try {
      await linkTasks({ taskId: task._id, linkedTasksIds: [taskId], operation: "Pull" });
    } catch (error) {
      console.error("Failed to unlink task:", error);
    }
  }

  const handleSelectUser = async (userId: string) => {
    const user = team.members.find(member => member.user._id === userId)?.user

    if(user && !localTask.assignedTo.find(au => au._id === userId)) {
      setLocalTask((prev) => ({
        ...prev,
        assignedTo: [...prev.assignedTo, user]
      }))

      onUpdate({ ...localTask, assignedTo: localTask.assignedTo.concat([user])})

      try {
        const updatedIds = [...localTask.assignedTo.map((as) => as._id), user._id];
        await assignTask({ taskId: task._id, assigneesIds: updatedIds }, 'json');
      } catch (error) {
        console.error("Failed to assign task:", error);
      }
    }
  }

  const handleRemoveAssignee = async (userId: string) => {
    setLocalTask((prev) => ({
      ...prev,
      assignedTo: [...prev.assignedTo.filter(user => user._id !== userId)]
    }))

    onUpdate({ ...localTask, assignedTo: localTask.assignedTo.filter(user => user._id !== userId) })

    try {
      const updatedIds = localTask.assignedTo.filter((user) => user._id !== userId).map((user) => user._id);
      await assignTask({ taskId: task._id, assigneesIds: updatedIds }, 'json');
    } catch (error) {
      console.error("Failed to unassign task:", error);
    }
  }

  const handleSubtaskAdd = (newSubtask: PopulatedTaskType) => {
    setLocalTask((prevTask) => ({
      ...prevTask,
      subTasks: [...prevTask.subTasks, newSubtask],
    }))
    setSubTaskAccorditionValue("subtasks")
    onUpdate(localTask)
  }

  const handleCommentAdd = async (newComment: string, attachments: string[]) => {
    const result = await createComment({ content: newComment, clerkId: currentUser.clerkId, taskId: task._id, attachments}, 'json')

    setLocalTask((prevTask) => ({
      ...prevTask,
      comments: [JSON.parse(result), ...prevTask.comments],
    }))
    onUpdate(localTask)
  }

  const handleAddLabel = async (label: string) => {
    if (label.trim()) {
      setLocalTask((prev) => ({
        ...prev,
        labels: [...(prev.labels || []), label.trim()],
      }))

      setIsAddingLabel(false)
      onUpdate(localTask)

      try {
        const updatedLabels = [...(localTask.labels || []), label.trim()];
        await updateTaskLabels({ taskId: task._id, labels: updatedLabels }, 'json');
      } catch (error) {
        console.error("Failed to add label:", error);
      }
    }
  }

  const handleRemoveLabel = async (label: string) => {
    setLocalTask((prev) => ({
      ...prev,
      labels: [...(prev.labels.filter(l => l !== label))],
    }))
    onUpdate(localTask)

    try {
      const updatedLabels = localTask.labels.filter((l) => l !== label);
      await updateTaskLabels({ taskId: task._id, labels: updatedLabels }, 'json');
    } catch (error) {
      console.error("Failed to remove label:", error);
    }
  }

  const handleAttachmentAdd = async (attachments: string[]) => {
    setLocalTask(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...attachments]
    }))

    await addAttachmentsToTask({ taskId: task._id, attachmentsLinks: attachments}, 'json')
  }
  
  const handleAttachmentRemove = async (attachments: string[], index: number) => {
    setLocalTask(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))

    await removeAttachmentsFromTask({ taskId: task._id, attachmentLinks: attachments }, 'json')
  }

  const handleSubtaskColumnChange = async (subtaskId: string, columnId: string) => {
    setLocalTask((prev) => ({
      ...prev,
      subTasks: prev.subTasks.map((st) =>
        st._id === subtaskId ? { ...st, column: columnId } : st
      ),
    }))

    await updateTaskColumn({ taskId: subtaskId, columnId })
  }
  if (!isOpen || !modalRoot) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <Badge className={`mb-2 ${task.type === "Bug" ? "bg-red-500 hover:bg-red-600" : "bg-neutral-500 hover:bg-neutral-400"}`}>
                {task.type}
              </Badge>
              <h2 className="text-xl lg:text-2xl font-semibold text-zinc-100">{localTask.description}</h2>
            </div>
            <Button variant="outline" size="icon" onClick={onClose}>
              <FiX className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Column */}
          <ScrollArea className="flex-1 border-r border-zinc-800 relative">
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
                    <Button variant="outline" size="sm" onClick={() => setIsEditingDescription(true)}>
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
                      className="h-24 text-white bg-zinc-800/50 border-zinc-700 resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <Button className="text-white bg-transparent" variant="ghost" size="sm" onClick={handleDescriptionCancel}>
                        Cancel
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleDescriptionSave}>
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
                {localTask.subTasks.length > 0 ? (
                  <SubtaskList 
                    subtasks={localTask.subTasks}
                    onColumnChange={handleSubtaskColumnChange}
                    value={subTaskAccorditionValue}
                    setSubtaskAcorditionValue={setSubTaskAccorditionValue}
                    columns={columns}
                  />
                ) : (
                  <p className="text-zinc-500 italic">No subtasks yet</p>
                )}
                <AddSubtask 
                  onSubtaskAdd={handleSubtaskAdd} 
                  parentTaskId={localTask._id} 
                  team={team} 
                  currentUser={currentUser}
                  parentTaskColumnId={localTask.column as string}
                  boardId={task.board as string}
                />
              </div>

              <Separator className="bg-zinc-800" />

              <TaskAttachments
                attachments={localTask.attachments}
                onAttachmentAdd={handleAttachmentAdd}
                onAttachmentRemove={handleAttachmentRemove}
              />

              <Separator className="bg-zinc-800" />

              {/* Comment Field */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-zinc-100">Add Comment</h3>
                {/* @ts-ignore */}
                <CommentField onCommentAdd={handleCommentAdd}/>
              </div>

              {/* Comments */}
              {localTask.comments.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-zinc-100">Comments</h3>
                  <div className="space-y-4">
                    {localTask.comments.map((comment, index) => (
                      <div key={index} className="flex gap-3 p-3 rounded-lg bg-zinc-800/50">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={comment.author.profilePicture}/>
                          <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-zinc-100">{comment.author.name}</span>
                            <span className="text-xs text-zinc-500">{format(new Date(comment.createdAt), "PPp")}</span>
                          </div>
                          <p 
                           className="text-sm text-zinc-300"
                           dangerouslySetInnerHTML={{ __html: comment.content }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Right Column */}
          <ScrollArea className="w-80 lg:w-96 flex-shrink-0 overflow-y-auto">
            <div className="p-4 lg:p-6 space-y-6">
              <div className="space-y-3">
                <h4 className="font-medium text-zinc-100">Assignees</h4>
                <div className="flex flex-wrap gap-2">
                  {localTask.assignedTo.map((assignee) => (
                    <Badge
                      key={assignee._id}
                      variant="secondary"
                      className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 cursor-pointer"
                      onClick={() => handleRemoveAssignee(assignee._id)}
                    >
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={assignee.profilePicture} />
                        <AvatarFallback>{assignee.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-white">{assignee.name}</span>
                    </Badge>
                  ))}
                </div>
                <UserSelectionCombobox team={team} assignees={localTask.assignedTo} onUserSelect={handleSelectUser} />
              </div>

              <Separator className="bg-zinc-800" />

              <div className="space-y-3">
                <h4 className="font-medium text-zinc-100">Labels</h4>
                <div className="flex flex-wrap gap-2">
                  {localTask.labels?.map((label, index) => (
                    <Badge key={index} className="flex gap-2 items-center bg-zinc-800 hover:bg-zinc-700">
                      {label}
                      <FiX className="cursor-pointer hover:text-zinc-300 mt-0.5" onClick={() => handleRemoveLabel(label)}/>
                    </Badge>
                  ))}
                </div>
                {isAddingLabel ? (
                  <AddLabel 
                    taskId={localTask._id}
                    onLabelAdd={handleAddLabel}
                    setIsAddingLabel={setIsAddingLabel}
                  />
                ) : (
                  <Button className="h-7" variant="outline" size="sm" onClick={() => setIsAddingLabel(true)}>
                    <FiPlus className="mr-2 h-4 w-4" /> Add Label
                  </Button>
                )}
              </div>

              <Separator className="bg-zinc-800" />

              <div className="space-y-3">
                <h4 className="font-medium text-zinc-100">Linked Tasks</h4>
                  <LinkedTaskSelectionCombobox
                    allTasks={allTasks}
                    currentTaskId={localTask._id}
                    linkedTaskIds={localTask.linkedTasks.map((lt) => lt._id)}
                    onTaskSelect={handleLinkedTaskAdd}
                  />
                <div className="space-y-2">
                  {localTask.linkedTasks.map((linkedTask) => (
                    <LinkedTaskItem key={linkedTask._id} task={linkedTask} handleUnlinkTask={handleUnlinkTask}/>
                  ))}
                </div>
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

