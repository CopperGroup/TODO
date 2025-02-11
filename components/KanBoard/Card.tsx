"use client"

import { motion } from "framer-motion"
import DropIndicator from "./Indicators"
import React, { useState } from "react"
import TaskModal from "./TaskModal/TaskModal"
import type { PopulatedColumnType, PopulatedTaskType, PopulatedTeamType } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "../ui/badge"

const TruncatedLabel = ({ label }: { label: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger>
        <Badge className="flex gap-2 items-center bg-zinc-500 hover:bg-zinc-700 max-w-[100px]">
          <span className="truncate">{label}</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  </TooltipProvider>
)

const Card = ({
  handleDragStart,
  task,
  team,
  currentUser,
  allTasks,
  columns,
}: {
  handleDragStart: any
  task: PopulatedTaskType
  team: PopulatedTeamType
  currentUser: { clerkId: string; email: string }
  allTasks: PopulatedTaskType[]
  columns: PopulatedColumnType[]
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCardClick = () => {
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
  }

  const handleTaskUpdate = (updatedTask: PopulatedTaskType) => {
    task.description = updatedTask.description
    task.assignedTo = updatedTask.assignedTo
    task.subTasks = updatedTask.subTasks
    task.labels = updatedTask.labels
    // Here you would typically update the task in your state or make an API call
    console.log("Task updated:", updatedTask)
  }

  // Show only the first 2 labels
  const visibleLabels = task.labels?.slice(0, 2) || []
  const hiddenLabelsCount = (task.labels?.length || 0) - visibleLabels.length

  // Find the first image attachment
  const firstImageAttachment = task.attachments?.find((attachment) =>
    /\.(jpeg|jpg|gif|png|webp|bmp)$/i.test(attachment),
  )

  return (
    <React.Fragment>
      <DropIndicator beforeId={task._id} column={task.column as unknown as string} />
      <motion.div
        layout
        layoutId={task._id}
        draggable="true"
        onDragStart={(e) =>
          handleDragStart(e, { description: task.description, _id: task._id, column: task.column as unknown as string })
        }
        onClick={handleCardClick}
        className="relative cursor-grab rounded border border-neutral-700 bg-neutral-800 p-3 active:cursor-grabbing focus:cursor-grabbing"
      >
        {firstImageAttachment && (
          <div className="mb-3">
            <img
              src={firstImageAttachment || "/placeholder.svg"}
              alt="Task attachment"
              className="w-full h-32 object-cover rounded-md"
            />
          </div>
        )}
        <p className="text-sm text-neutral-100 mb-4">{task.description}</p>

        <div className="w-full flex flex-wrap gap-2 mb-2">
          {visibleLabels.map((label, index) => (
            <TruncatedLabel key={index} label={label} />
          ))}
          {hiddenLabelsCount > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge className="flex gap-2 items-center bg-zinc-500 hover:bg-zinc-700">
                    +{hiddenLabelsCount} more
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>{task.labels?.slice(2).join(", ")}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <div className="flex justify-between items-center gap-1">
          <div className="flex items-center gap-1">
            <div
              className={`w-[14px] h-[14px] rounded ${task.type?.toLowerCase() === "bug" ? "bg-red-500" : "bg-neutral-500"}`}
            />
            <span className="text-xs font-medium text-neutral-300">{task.type === "Bug" ? "Bug" : "Issue"}</span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex -space-x-2">
                  {task.assignedTo.slice(0, 2).map((assignee, index) => (
                    <Avatar key={index} className="w-6 h-6 border-2 border-neutral-400">
                      <AvatarImage src={assignee.profilePicture} />
                      <AvatarFallback>{assignee.name[0]}</AvatarFallback>
                    </Avatar>
                  ))}
                  {task.assignedTo.length > 2 && (
                    <Avatar className="w-6 h-6 bg-zinc-700 text-white border-2 border-white">
                        {task.assignedTo.length === 3 ? (
                          <AvatarImage src={task.assignedTo[2].profilePicture} />
                        ) : (
                          <AvatarFallback>
                          `+${task.assignedTo.length - 2}`
                          </AvatarFallback>
                        )}
                    </Avatar>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Assignees</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </motion.div>
      <TaskModal
        task={task}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onUpdate={handleTaskUpdate}
        team={team}
        allTasks={allTasks}
        currentUser={currentUser}
        columns={columns}
      />
    </React.Fragment>
  )
}

export default Card

