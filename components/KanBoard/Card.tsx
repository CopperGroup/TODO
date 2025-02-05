import { motion } from "framer-motion";
import DropIndicator from "./Indicators";

const Card = ({ title, id, column, handleDragStart }: { title: string, id: string, column: string, handleDragStart: any}) => {
  return (
    <>
      <DropIndicator beforeId={id} column={column}/>
      <motion.div
       layout
       layoutId={id}
       draggable="true"
       onDragStart={(e) => handleDragStart(e, { title, id, column })}
       className="cursor-grab rounded border border-neutral-700 bg-neutral-800 p-3 active:cursor-grabbing focus:cursor-grabbing">
        <p className="text-sm text-neutral-100">{title}</p>
      </motion.div>
    </>
  )
}

export default Card;