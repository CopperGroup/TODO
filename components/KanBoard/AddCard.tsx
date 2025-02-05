import { useState } from "react";

import { motion } from 'framer-motion'
import { Card } from "@/lib/types";
import { FiPlus } from "react-icons/fi";

const AddCard = ({ column, setCards }: { column: string, setCards: any }) => {
    const [ text, setText ] = useState("");
    const [ adding, setAdding ] = useState(false);
  
    const handleSubmit = (e: any) => {
      e.preventDefault();
  
      if (!text.trim().length) return;
  
      const newCard = {
        column,
        title: text.trim(),
        id: Math.random().toString(),
      }
  
      setCards((pv: Card[]) => [...pv, newCard])
  
      setAdding(false);
    }
  
    return (
      <>
        {adding ? (
          <motion.form
           layout 
           onSubmit={handleSubmit}>
            <textarea
              onChange={(e) => setText(e.target.value)}
              autoFocus
              placeholder="Add new task..."
              className="w-full rounded border coppergroup-gradient p-3 text-sm text-neutral-50 placeholder-white focus:outline-0"
            />
            <div className="mt-1.5 flex items-center justify-end gap-1.5">
              <button
              onClick={() => setAdding(false)}
              className="px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50"
              >
                Close
              </button>
  
              <button 
              type="submit" 
              className="flex items-center gap-1.5 rounded bg-neutral-50 px-3 py-1.5 text-xs text-neutral-950 transition-colors hover:bg-neutral-300"
              >
                <span>Add</span> 
                <FiPlus/>
              </button>
            </div>
          </motion.form>
        ) : <motion.button
         layout
         onClick={() => setAdding(true)}
         className="flex gap-[2px] items-center px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50"
        >
            <span>Add card</span>
            <FiPlus/>
          </motion.button>
        }
      </>
    )
}

export default AddCard