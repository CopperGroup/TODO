import { Card as CardType, PopulatedTaskType } from "@/lib/types";
import React, { useState } from "react";
import DropIndicator from "./Indicators";
import Card from "./Card";
import AddCard from "./AddCard";
import { changeTasksColumn } from "@/lib/actions/board.actions";
import { updateTaskColumn } from "@/lib/actions/task.actions";
import { TeamType } from "@/lib/models/team.model";
import { UserType } from "@/lib/models/user.model";

const Column= ({ 
  boardId,
  title, 
  headingColor, 
  column, 
  cards, 
  setCards, 
  handleColumnDragStart, 
  isDraggingColumn,
  team,
  setIsDraggingColumn,
  // handleColumnDragOver,
  // handleColumnDragEnd,
  // handleColumnDragLeave,
}: { 
  boardId: string,
  title: string, 
  column: string, 
  headingColor: string, 
  team: TeamType & { users: { user: UserType, role: "Admin" | "Member"}},
  cards: any[], 
  setCards: any, 
  handleColumnDragStart: any, 
  isDraggingColumn: boolean,
  setIsDraggingColumn: React.Dispatch<React.SetStateAction<boolean>>,
  // handleColumnDragOver: (e: any) => void,
  // handleColumnDragEnd: (e: any) => void,
  // handleColumnDragLeave: (e: any) => void,
}) => {
  const [active, setActive] = useState(false);

  const handleDragStart = (e: any, card: PopulatedTaskType) => {
    setIsDraggingColumn(false)
    e.dataTransfer.setData("cardId", card._id);
  };

  const handleDragEnd = async (e: any) => {
    const cardId = e.dataTransfer.getData("cardId");

    setActive(false);
    clearHighlights();

    const indicators = getIndicators();
    const { element } = getNearestIndicator(e, indicators);

    const before = element.dataset.before || "-1";

    if (before !== cardId) {
      let copy = [...cards];

      let cardToTransfer = copy.find((c) => c._id === cardId);
      if (!cardToTransfer) return;
      cardToTransfer = { ...cardToTransfer, column };

      copy = copy.filter((c) => c._id !== cardId);

      const moveToBack = before === "-1";

      if (moveToBack) {
        copy.push(cardToTransfer);
      } else {
        const insertAtIndex = copy.findIndex((el) => el._id === before);
        if (insertAtIndex === undefined) return;

        copy.splice(insertAtIndex, 0, cardToTransfer);
      }
      
      setCards(copy);
      
      await updateTaskColumn({ taskId: cardToTransfer._id, columnId: cardToTransfer.column})
      await changeTasksColumn({ boardId, tasks: copy})
    }
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();

    if(!isDraggingColumn) {
      highlightIndicator(e);
      setActive(true);
    }
  };

  const clearHighlights = (els?: any[]) => {
    const indicators = els || getIndicators();

    indicators.forEach((i) => {
      i.style.opacity = "0";
    });
  };

  const highlightIndicator = (e: any) => {
    const indicators = getIndicators();

    clearHighlights(indicators);

    const el = getNearestIndicator(e, indicators);

    el.element.style.opacity = "1";
  };

  const getNearestIndicator = (e: any, indicators: any) => {
    const DISTANCE_OFFSET = 50;

    const el = indicators.reduce(
      (closest: any, child: any) => {
        const box = child.getBoundingClientRect();

        const offset = e.clientY - (box.top + DISTANCE_OFFSET);

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      {
        offset: Number.NEGATIVE_INFINITY,
        element: indicators[indicators.length - 1],
      }
    );

    return el;
  };

  const getIndicators = () => {
    return Array.from(document.querySelectorAll(`[data-column="${column}"]`));
  };


  const handleDragLeave = () => {
    clearHighlights();
    setActive(false);
  };

  const filteredCards = cards.filter((c) => c.column === column);

  return (
    <div className="w-56 shrink-0"           
    >
      <div 
        className="mb-3 flex items-center justify-between  cursor-grab active:cursor-grabbing focus:cursor-grabbing"  
        draggable="true"         
        onDragStart={(e) => handleColumnDragStart(e, column)}
      >
        <h3 className={`font-medium`} style={{ color: headingColor }}>{title}</h3>
        <span className="rounded text-sm text-neutral-400">
          {filteredCards.length}
        </span>
      </div>
      <div
        onDrop={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`h-full w-full transition-colors ${
          active ? "bg-neutral-800/50" : "bg-neutral-800/0"
        }`}
      >
        {filteredCards.map((c) => {
          return <Card key={c._id} {...c} handleDragStart={handleDragStart} />;
        })}
        <DropIndicator beforeId={null} column={column} />
        <AddCard 
          columnId={column} 
          setCards={setCards} 
          boardId={boardId}
          teamId={team._id}
        />
      </div>
    </div>
  );
} 

export default Column;