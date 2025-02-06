import { motion } from "framer-motion";
import DropIndicator from "./Indicators";
import React from "react";

const Card = ({
  description,
  _id,
  column,
  handleDragStart,
  type,
}: {
  description: string;
  _id: string;
  column: string;
  handleDragStart: any;
  type: string;
}) => {
  return (
    <React.Fragment>
      <DropIndicator beforeId={_id} column={column} />
      <motion.div
        layout
        layoutId={_id}
        draggable="true"
        onDragStart={(e) => handleDragStart(e, { description, _id, column })}
        className="relative cursor-grab rounded border border-neutral-700 bg-neutral-800 p-3 active:cursor-grabbing focus:cursor-grabbing"
      >
        <p className="text-sm text-neutral-100 mb-4">{description}</p>
        
        <div className="flex items-center gap-1">
          <div
            className={`w-[14px] h-[14px] rounded ${
              type.toLowerCase() === "bug" ? "bg-red-500" : "bg-blue-500"
            }`}
          />
          <span className="text-xs font-medium text-neutral-300">
            {type === "Bug" ? "Bug" : "Issue"}
          </span>
        </div>
      </motion.div>
    </React.Fragment>
  );
};

export default Card;
