"use client"

import React, { useState } from "react"
import { format } from "date-fns"
import { FiClock, FiEdit2, FiCheck, FiX, FiPlus } from "react-icons/fi"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import LinkedTaskSelectionCombobox from "./LinkedTaskSelectionCombobox"
import LinkedTaskItem from "./LinkedTaskItem"
import AddSubtask from "./AddSubtask"
import AddLabel from "./AddLabel"
import UserSelectionCombobox from "./UserSelectionCombobox"
import type { TeamTasks } from "@/lib/types"
import { addAttachmentsToTask, assignTask, linkTasks, removeAttachmentsFromTask, updateTaskColumn, updateTaskDescription, updateTaskLabels } from "@/lib/actions/task.actions"
import TaskAttachments from "./TaskAttachments"
import SubtaskList from "@/components/admin-components/Tasks/SubtaskList"


interface InfoListAttachmentProps {
  task: TeamTasks["tasks"][number]
  columns: TeamTasks["boards"][number]["columns"]
  team: TeamTasks
  currentUser: { clerkId: string; email: string }
  onClose: () => void
  onUpdate: (updatedTask: TeamTasks["tasks"][number]) => void
  allTasks: TeamTasks["tasks"]
  boardId: string
}

const InfoListAttachment: React.FC<InfoListAttachmentProps> = ({
  task,
  columns,
  team,
  currentUser,
  onClose,
  onUpdate,
  allTasks,
  boardId,
}) => {
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(task.description);
  const [subtaskAccordionValue, setSubtaskAccordionValue] = useState("");
  const [isAddingLabel, setIsAddingLabel] = useState(false);

const handleDescriptionSave = async () => {
    onUpdate({ ...task, description: editedDescription });
    setIsEditingDescription(false);
    await updateTaskDescription({
      taskId: task._id,
      prevDescription: task.description,
      newDescription: editedDescription,
    }, 'json');
  };

  const handleDescriptionCancel = () => {
    setEditedDescription(task.description);
    setIsEditingDescription(false);
  };

  const handleSubtaskAdd = (newSubtask: TeamTasks["tasks"][number]["subTasks"][number]) => {
    setSubtaskAccordionValue("subtasks")
    onUpdate({ ...task, subTasks: [...task.subTasks, newSubtask] });
  };

  const handleSubtaskColumnChange = async (subtaskId: string, columnId: string) => {
    const updatedSubtasks = task.subTasks.map((subtask) =>
      subtask._id === subtaskId ? { ...subtask, column: columnId } : subtask
    );
    onUpdate({ ...task, subTasks: updatedSubtasks });
    await updateTaskColumn({ taskId: subtaskId, columnId });
  };

  const handleLinkedTaskAdd = async (linkedTask: TeamTasks["tasks"][number]["linkedTasks"][number]) => {
    const updatedLinkedTasks = [...task.linkedTasks, linkedTask];
    onUpdate({ ...task, linkedTasks: updatedLinkedTasks });
    await linkTasks({ taskId: task._id, linkedTasksIds: updatedLinkedTasks.map((t) => t._id), operation: "Push" }, 'json');
  };

  const handleLinkedTaskRemove = async (linkedTaskId: string) => {
    const updatedLinkedTasks = task.linkedTasks.filter((lt) => lt._id !== linkedTaskId);
    onUpdate({ ...task, linkedTasks: updatedLinkedTasks });
    await linkTasks({ taskId: task._id, linkedTasksIds: [linkedTaskId], operation: "Pull" }, 'json');
  };

  const handleLabelAdd = async (newLabel: string) => {
    const updatedLabels = [...task.labels, newLabel];
    onUpdate({ ...task, labels: updatedLabels });
    setIsAddingLabel(false);
    await updateTaskLabels({ taskId: task._id, labels: updatedLabels }, 'json');
  };

  const handleLabelRemove = async (labelToRemove: string) => {
    const updatedLabels = task.labels.filter((label) => label !== labelToRemove);
    onUpdate({ ...task, labels: updatedLabels });
    await updateTaskLabels({ taskId: task._id, labels: updatedLabels }, 'json');
  };

  const handleAssigneeAdd = async (userId: string) => {
    const newAssignee = team.members.find((member) => member.user._id === userId)?.user;
    if (newAssignee) {
      const updatedAssignees = [...task.assignedTo, newAssignee];
      onUpdate({ ...task, assignedTo: updatedAssignees });
      await assignTask({
        taskId: task._id,
        assigneesIds: updatedAssignees.map((a) => a._id),
      }, 'json');
    }
  };

  const handleAssigneeRemove = async (userId: string) => {
    const updatedAssignees = task.assignedTo.filter((assignee) => assignee._id !== userId);
    onUpdate({ ...task, assignedTo: updatedAssignees });
    await assignTask({
      taskId: task._id,
      assigneesIds: updatedAssignees.map((a) => a._id),
    }, 'json');
  };

  const handleAttachmentAdd = async (attachments: string[]) => {
    const updatedAttachments = [...task.attachments, ...attachments];
    onUpdate({ ...task, attachments: updatedAttachments });
    await addAttachmentsToTask({ taskId: task._id, attachmentsLinks: attachments }, 'json');
  };

  const handleAttachmentRemove = async (attachments: string[], index: number) => {
    const updatedAttachments = task.attachments.filter((_, i) => i !== index);
    onUpdate({ ...task, attachments: updatedAttachments });
    await removeAttachmentsFromTask({ taskId: task._id, attachmentLinks: attachments }, 'json');
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Badge
            className={`${
              task.type === "Bug" ? "bg-red-100 text-red-800 hover:bg-red-200" : "bg-blue-100 text-blue-800 hover:bg-blue-200"
            } text-xs font-semibold px-2 py-1 rounded`}
          >
            {task.type}
          </Badge>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <FiX className="h-4 w-4" />
          </Button>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{task.description}</h2>
        <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <FiClock className="w-4 h-4" />
            <span>Created {format(new Date(task.createdAt), "PPp")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={task.author.profilePicture} />
              <AvatarFallback>{task.author.name[0]}</AvatarFallback>
            </Avatar>
            <span>{task.author.name}</span>
          </div>
        </div>
        

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Description</h3>
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
                className="min-h-[100px] text-gray-900 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={handleDescriptionCancel}>
                  Cancel
                </Button>
                <Button variant="default" size="sm" onClick={handleDescriptionSave}>
                  <FiCheck className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="prose max-w-none bg-gray-50 rounded-lg p-3">
              <p className="text-gray-700">{task.description}</p>
            </div>
          )}
        </div>

        <Separator className="bg-gray-200" />

        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Assignees</h4>
          <div className="flex flex-wrap gap-2">
            {task.assignedTo.map((assignee) => (
              <Badge
                key={assignee._id}
                variant="secondary"
                className="flex items-center gap-2 bg-gray-100 text-gray-800 hover:bg-gray-200"
              >
                <Avatar className="w-5 h-5">
                  <AvatarImage src={assignee.profilePicture || ""} />
                  <AvatarFallback>{assignee.name[0]}</AvatarFallback>
                </Avatar>
                <span>{assignee.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto"
                  onClick={() => handleAssigneeRemove(assignee._id)}
                >
                  <FiX className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
            <UserSelectionCombobox team={team} assignees={task.assignedTo} onUserSelect={handleAssigneeAdd} />
          </div>
        </div>

        <Separator className="bg-gray-200" />
          <TaskAttachments
            attachments={task.attachments}
            onAttachmentAdd={handleAttachmentAdd}
            onAttachmentRemove={handleAttachmentRemove}
          />

        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Labels</h4>
          <div className="flex flex-wrap gap-2">
            {task.labels.map((label) => (
              <Badge key={label} variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                {label}
                <Button variant="ghost" size="sm" className="ml-1 p-0 h-auto" onClick={() => handleLabelRemove(label)}>
                  <FiX className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
            {isAddingLabel ? (
              <AddLabel taskId={task._id} onLabelAdd={handleLabelAdd} setIsAddingLabel={setIsAddingLabel} />
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingLabel(true)}
                className="text-gray-600 hover:text-gray-900"
              >
                <FiPlus className="w-4 h-4 mr-1" /> Add Label
              </Button>
            )}
          </div>
        </div>

        <Separator className="bg-gray-200" />

        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Column</h4>
          <Select
            value={task.column._id}
            onValueChange={(value) => onUpdate({ ...task, column: { ...task.column, _id: value } })}
          >
            <SelectTrigger className="h-7 w-[120px] text-xs bg-gray-50 border-zinc-200 focus:ring-blue-500">
              <SelectValue placeholder="Select a column" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-800 border-zinc-700 focus:ring-blue-500">
              {columns.map((column) => (
                <SelectItem 
                 className="text-xs font-medium focus:bg-neutral-700"
                 key={column._id} 
                 value={column._id}
                 style={{ color: column.textColor }}
                >
                  {column.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator className="bg-gray-200" />


        <SubtaskList
          subtasks={task.subTasks}
          onColumnChange={handleSubtaskColumnChange}
          value={subtaskAccordionValue}
          setSubtaskAcorditionValue={setSubtaskAccordionValue}
          columns={columns}
        />

        <AddSubtask
          onSubtaskAdd={handleSubtaskAdd}
          parentTaskId={task._id}
          team={team}
          currentUser={currentUser}
          parentTaskColumnId={typeof task.column === 'string' ? task.column : task.column._id}
          boardId={boardId}
        />

        <Separator className="bg-gray-200" />

        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Linked Tasks</h4>
          <div className="space-y-2">
            {task.linkedTasks.map((linkedTask) => (
              <LinkedTaskItem key={linkedTask._id} task={linkedTask} handleUnlinkTask={handleLinkedTaskRemove} />
            ))}
          </div>
          <LinkedTaskSelectionCombobox
            allTasks={allTasks}
            currentTaskId={task._id}
            linkedTaskIds={task.linkedTasks.map(t => t._id)}
            onTaskSelect={handleLinkedTaskAdd}
          />
        </div>
      </div>
    </ScrollArea>
  )
}

export default InfoListAttachment
