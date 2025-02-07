"use client"

import { motion } from "framer-motion"
import DropIndicator from "./Indicators"
import React, { useState } from "react"
import type { TaskType } from "@/lib/models/task.model"
import TaskModal from "./TaskModal"
import { PopulatedTaskType, PopulatedTeamType } from "@/lib/types"

const Card = ({
  description,
  _id,
  column,
  handleDragStart,
  type,
  task,
  team,
  allTasks,
}: {
  description: string
  _id: string
  column: string
  handleDragStart: any
  type: string
  task: PopulatedTaskType,
  team: PopulatedTeamType,
  allTasks: PopulatedTaskType[],
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCardClick = () => {
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
  }

  const handleTaskUpdate = (updatedTask: PopulatedTaskType) => {
    // Here you would typically update the task in your state or make an API call
    console.log("Task updated:", updatedTask)
  }

  return (
    <React.Fragment>
      <DropIndicator beforeId={_id} column={column} />
      <motion.div
        layout
        layoutId={_id}
        draggable="true"
        onDragStart={(e) => handleDragStart(e, { description, _id, column })}
        onClick={handleCardClick}
        className="relative cursor-grab rounded border border-neutral-700 bg-neutral-800 p-3 active:cursor-grabbing focus:cursor-grabbing"
      >
        <p className="text-sm text-neutral-100 mb-4">{description}</p>

        <div className="flex items-center gap-1">
          <div className={`w-[14px] h-[14px] rounded ${type.toLowerCase() === "bug" ? "bg-red-500" : "bg-blue-500"}`} />
          <span className="text-xs font-medium text-neutral-300">{type === "Bug" ? "Bug" : "Issue"}</span>
        </div>
      </motion.div>
      <TaskModal task={task} isOpen={isModalOpen} onClose={handleModalClose} onUpdate={handleTaskUpdate} team={team} allTasks={allTasks}/>
    </React.Fragment>
  )
}

export default Card

