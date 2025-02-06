'use client'

import { useState } from "react";
import { motion } from 'framer-motion'
import { Card } from "@/lib/types";
import { FiPlus } from "react-icons/fi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createNewTask } from "@/lib/actions/task.actions";
import { useUser } from "@clerk/nextjs";
import { TaskType } from "@/lib/models/task.model";

const AddCard = ({ columnId, teamId, boardId, setCards }: { columnId: string; teamId: string, boardId: string, setCards: React.Dispatch<React.SetStateAction<TaskType[]>> }) => {
    const [text, setText] = useState("");
    const [adding, setAdding] = useState(false);
    const [cardType, setCardType] = useState<"Issue" | "Bug">("Issue");
  
    const { user } = useUser();

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
  
      if (!text.trim().length) return;
  
      const result = await createNewTask({ clerkId: user?.id, teamId, columnId, boardId, decription: text.trim(), taskType: cardType }, 'json')

      const createdTask: TaskType = JSON.parse(result);
  
      setCards((pv: TaskType[]) => [...pv, createdTask])
  
      setAdding(false);
      setText("");
      setCardType("Issue");
    }
  
    return (
      <>
        {adding ? (
          <motion.form
           layout 
           onSubmit={handleSubmit}
           className="space-y-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              autoFocus
              placeholder="Add new task..."
              className="w-full rounded border coppergroup-gradient p-3 text-sm text-neutral-50 placeholder-white focus:outline-0"
            />
            <div className="mt-1.5 flex items-center justify-between gap-1.5">
              <Select 
                value={cardType} 
                onValueChange={(value: "Issue" | "Bug") => setCardType(value)}
              >
                <SelectTrigger className="w-24 h-7 px-2 text-xs bg-neutral-800 text-neutral-50 border-neutral-700">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-700 text-neutral-50">
                  <SelectItem value="Issue" className="focus:bg-neutral-700 focus:text-neutral-50">
                    <div className="w-full flex items-center gap-1">
                      <div className="w-[14px] h-[14px] bg-gray-500 rounded-sm" />
                      <span className="mb-0.5">Issue</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Bug" className="focus:bg-neutral-700 focus:text-neutral-50">
                    <div className="w-full flex items-center gap-1">
                      <div className="w-[14px] h-[14px] bg-red-500 rounded-sm" />
                      <span className="mb-0.5">Bug</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setAdding(false)}
                  className="px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50"
                >
                  Cancel
                </button>
    
                <button 
                  type="submit" 
                  className="flex items-center gap-1.5 rounded bg-neutral-50 px-3 py-1.5 text-xs text-neutral-950 transition-colors hover:bg-neutral-300"
                >
                  <span>Add</span> 
                  <FiPlus/>
                </button>
              </div>
            </div>
          </motion.form>
        ) : (
          <motion.button
            layout
            onClick={() => setAdding(true)}
            className="flex gap-[2px] items-center px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50"
          >
            <span>Add card</span>
            <FiPlus/>
          </motion.button>
        )}
      </>
    )
}

export default AddCard
