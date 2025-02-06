"use client"

import type React from "react"
import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { FiX, FiPaperclip, FiTrash2 } from "react-icons/fi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Combobox } from "../ui/combobox"
import type { TaskType } from "@/lib/models/task.model"
import type { UserType } from "@/lib/models/user.model"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface TaskDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (taskDetails: Partial<TaskType>) => void
  teamMembers: { user: UserType; role: "Admin" | "Member" }[]
  tasks: TaskType[]
}

const getTaskTypeColor = (type: string) => {
  switch (type) {
    case "bug":
      return "bg-red-500"
    case "feature":
      return "bg-green-500"
    case "improvement":
      return "bg-blue-500"
    default:
      return "bg-gray-500"
  }
}

export const TaskDetailsForm: React.FC<TaskDetailsModalProps> = ({ isOpen, onClose, onSubmit, teamMembers, tasks }) => {
  const [description, setDescription] = useState("")
  const [assignedTo, setAssignedTo] = useState<UserType[]>([])
  const [linkedTasks, setLinkedTasks] = useState<TaskType[]>([])
  const [taskType, setTaskType] = useState("issue")
  const [attachments, setAttachments] = useState<File[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      description,
      assignedTo,
      linkedTasks,
      type: taskType,
      attachments,
    })
    onClose()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl text-black dark:text-white shadow-xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Task Details</h2>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FiX size={24} />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              className="w-full mt-1 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-black dark:text-white"
            />
          </div>
          <div>
            <Label className="text-gray-700 dark:text-gray-300">Assigned To</Label>
            <Combobox
              items={teamMembers.map((m) => ({
                label: m.user.name,
                value: m.user._id,
                icon: (
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={m.user.profilePicture as string} alt={m.user.name} />
                    <AvatarFallback>{m.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                ),
              }))}
              onSelect={(item) => {
                const selectedUser = teamMembers.find((m) => m.user._id === item.value)?.user
                if (selectedUser && !assignedTo.some((u) => u._id === selectedUser._id)) {
                  setAssignedTo([...assignedTo, selectedUser])
                }
              }}
              placeholder="Assign team members"
              allowCustomValue={false}
              toastTitle="Invalid Selection"
              toastDescription="Please select a valid team member."
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {assignedTo.map((member) => (
                <div
                  key={member._id}
                  className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white px-2 py-1 rounded-full text-sm flex items-center"
                >
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarImage src={member.profilePicture} alt={member.name} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {member.name}
                  <button
                    type="button"
                    onClick={() => setAssignedTo(assignedTo.filter((m) => m._id !== member._id))}
                    className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-gray-700 dark:text-gray-300">Linked Tasks</Label>
            <Combobox
              items={tasks.map((task) => ({
                label: task.description,
                value: task._id,
                icon: <div className={`w-3 h-3 rounded-full mr-2 ${getTaskTypeColor(task.type)}`} />,
              }))}
              onSelect={(item) => {
                const selectedTask = tasks.find((t) => t._id === item.value)
                if (selectedTask && !linkedTasks.some((t) => t._id === selectedTask._id)) {
                  setLinkedTasks([...linkedTasks, selectedTask])
                }
              }}
              placeholder="Link tasks"
              allowCustomValue={false}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {linkedTasks.map((task) => (
                <div
                  key={task._id}
                  className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white px-2 py-1 rounded-full text-sm flex items-center"
                >
                  <div className={`w-3 h-3 rounded-full mr-2 ${getTaskTypeColor(task.type)}`} />
                  {task.description}
                  <button
                    type="button"
                    onClick={() => setLinkedTasks(linkedTasks.filter((t) => t._id !== task._id))}
                    className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-gray-700 dark:text-gray-300">Task Type</Label>
            <Select value={taskType} onValueChange={setTaskType}>
              <SelectTrigger className="w-full mt-1 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-black dark:text-white">
                <SelectValue placeholder="Select task type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="issue">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-400 dark:bg-gray-500 rounded-sm mr-2"></div>
                    Issue
                  </div>
                </SelectItem>
                <SelectItem value="bug">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded-sm mr-2"></div>
                    Bug
                  </div>
                </SelectItem>
                <SelectItem value="feature">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded-sm mr-2"></div>
                    Feature
                  </div>
                </SelectItem>
                <SelectItem value="improvement">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded-sm mr-2"></div>
                    Improvement
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-gray-700 dark:text-gray-300">Attachments</Label>
            <div className="mt-2 space-y-2">
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                <FiPaperclip className="mr-2" />
                Add Attachment
              </Button>
              <Input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded">
                  <span className="text-sm truncate">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeAttachment(index)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <FiTrash2 size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-white dark:bg-gray-800 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
            >
              Save Task
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

