"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface CommentFieldProps {
  onCommentAdd: (newComment: string) => void
  taskId: string
}

const CommentField: React.FC<CommentFieldProps> = ({ onCommentAdd, taskId }) => {
  const [comment, setComment] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return

    onCommentAdd(comment)
    setComment("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write a comment..."
        className="min-h-[100px] bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:ring-blue-500"
      />
      <div className="flex justify-end">
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={!comment.trim()}>
          Add Comment
        </Button>
      </div>
    </form>
  )
}

export default CommentField

