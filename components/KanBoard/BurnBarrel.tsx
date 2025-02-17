"use client"

import { useState } from "react"
import { FaFire } from "react-icons/fa"
import { FiTrash } from "react-icons/fi"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PopulatedTaskType } from "@/lib/types"
import { deleteTasks } from "@/lib/actions/task.actions"

type TaskType = (PopulatedTaskType & {
  tasksLinkedToThis: string[]; // Specify that this field is an array of strings
  board: string;
  team: string;
});

const BurnBarrel = ({ cards, setCards }: { cards: TaskType[], setCards: React.Dispatch<React.SetStateAction<TaskType[]>> }) => {
  const [active, setActive] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [cardToDelete, setCardToDelete] = useState<string | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setActive(true)
  }

  const handleDragLeave = () => {
    setActive(false)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    const cardId = e.dataTransfer.getData("cardId")
    setCardToDelete(cardId)
    setIsModalOpen(true)
    setActive(false)
  }

  const handleConfirmDelete = async () => {
    if (confirmText.toLowerCase() === "delete" && cardToDelete) {
      const taskToDelete = cards.find(c => c._id === cardToDelete);

      if(!taskToDelete) return;

      setCards((pv: TaskType[]) => pv.filter((card) => card._id !== cardToDelete))
      setIsModalOpen(false)
      setConfirmText("")
      setCardToDelete(null)
      await deleteTasks([{
        taskId: taskToDelete._id,
        teamId: taskToDelete.team,
        boardId: taskToDelete.board,
        commentIds: taskToDelete.comments.map(comment => comment._id),
        subTasksIds: taskToDelete.subTasks.map(subTask => subTask._id),
        tasksLinkedToThisIds: taskToDelete.tasksLinkedToThis,
        attachments: taskToDelete.attachments
      }])
    }
  }

  return (
    <>
      <div
        onDrop={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`mt-3 grid h-56 w-56 shrink-0 place-content-center rounded border text-3xl ${
          active ? "border-red-800 bg-red-800/20 text-red-500" : "border-neutral-500 bg-neutral-500/20 text-neutral-500"
        }`}
      >
        {active ? <FaFire className="animate-bounce" /> : <FiTrash />}
      </div>

      <Dialog open={isModalOpen} onOpenChange={(value) => {setIsModalOpen(value), setConfirmText("")}}>
        <DialogContent className="bg-neutral-800 text-white border-gray-100">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="text"
              placeholder="Type 'delete' to confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="bg-neutral-900 border-neutral-700 text-white"
            />
          </div>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={confirmText.toLowerCase() !== "delete"}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Task
            </Button>
            <Button
              variant="outline"
              onClick={() => {setIsModalOpen(false), setConfirmText("")}}
              className="bg-transparent border-white text-white hover:bg-white hover:text-black"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default BurnBarrel

