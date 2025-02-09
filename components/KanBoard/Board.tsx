"use client";

import React, { SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import Column from "./Column";
import BurnBarrel from "./BurnBarrel";
import { Column as ColumnType, PopulatedBoardType, PopulatedColumnType, PopulatedTaskType } from "@/lib/types";
import VerticalIndicator from "./VerticalIndicator";
import { AddColumn } from "./AddColumn";
import { motion } from "framer-motion"
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { changeBoardColumnsOrder } from "@/lib/actions/board.actions";

function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

type TaskType = (PopulatedTaskType & {
  tasksLinkedToThis: string[]; // Specify that this field is an array of strings
  board: string;
  team: string;
});

type BoardType = (PopulatedBoardType & { tasks: TaskType[]})

const Board = ({ stringifiedBoard }: { stringifiedBoard: string }) => {
  const board: BoardType = JSON.parse(stringifiedBoard)

  const { user, isLoaded } = useUser();

  const router = useRouter();
  
  if(isLoaded && !user) {
    router.push("/")
  }

  const [ cards, setCards ] = useState(board.tasks);
  const [ columns, setColumns ] = useState<PopulatedColumnType[]>(board.columns);
  const [ isDraggingColumn, setIsDraggingColumn ] = useState(false)
  const [viewportIndicator, setViewportIndicator] = useState({ left: 0, width: 100 })

  const handleColumnDragStart = (e: any, columnId: string) => {
    setIsDraggingColumn(true)
    e.dataTransfer.setData("columnId", columnId);
  };

  const handleColumnDragOver = (e: any) => {

    if(isDraggingColumn) {
      e.preventDefault();
  
      highlightColumnIndicator(e)
    }
  };

  const highlightColumnIndicator = (e: any) => {
    const indicators = getColumnIndicators();

    clearColumnHighlights(indicators);

    const el = getNearestColumnIndicator(e, indicators);

    el.element.style.opacity = "1";
  };

  const getNearestColumnIndicator = (e: any, indicators: any) => {
    const DISTANCE_OFFSET = 50;

    const el = indicators.reduce(
      (closest: any, child: any) => {
        const box = child.getBoundingClientRect();

        const offset = e.clientX - (box.right + DISTANCE_OFFSET);

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

  const getColumnIndicators = () => {
    if(isDraggingColumn) {
      return Array.from(document.querySelectorAll("[data-isColumn=true]"));
    } else {
      return []
    }
  };

  
  const clearColumnHighlights = (els?: any[]) => {
    const indicators = els || getColumnIndicators();

    indicators.forEach((i) => {
      i.style.opacity = "0";
    });
  };

  const handleColumnDragEnd = async (e: any) => {
    if(isDraggingColumn) {
      const columnId = e.dataTransfer.getData("columnId");
      
      console.log(columnId)
      clearColumnHighlights();
      
      const indicators = getColumnIndicators();

      console.log(indicators)
      const { element } = getNearestColumnIndicator(e, indicators);
      
      console.log( element )
      const beforeId = element.dataset.beforecolumn || "-1";

      console.log(beforeId)

      if(beforeId !== columnId) {
        let copy = [...columns]
        console.log(copy)

        let currentColumnIndex = copy.findIndex((c) => c._id === columnId);

        if (currentColumnIndex === -1) return;
      
        
        let columnToSwapIndex = beforeId !== "-1" ? copy.findIndex((c) => c._id === beforeId) : 0
        
        if(columnToSwapIndex === -1) return
        
        const moveToFront = beforeId === "-1"
        
        if(moveToFront) {
          let currentColumn = copy.splice(currentColumnIndex, 1)[0];
          copy.unshift(currentColumn)
        } else {
          [copy[currentColumnIndex], copy[columnToSwapIndex]] = [copy[columnToSwapIndex], copy[currentColumnIndex]];
        }

        setColumns(copy)

        await changeBoardColumnsOrder({ boardId: board._id, columnsIds: copy.map(c => c._id) })

      }
      setIsDraggingColumn(false)
    }
  };

  const handleColumnDragLeave = () => {
    clearColumnHighlights()
  };


  const containerRef = useRef<HTMLDivElement>(null)

  const updateViewportIndicator = useCallback(() => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current
      const left = (scrollLeft / scrollWidth) * 100
      const width = (clientWidth / scrollWidth) * 100
      setViewportIndicator({ left, width })
    }
  }, [])

  const debouncedUpdateViewportIndicator = useCallback(debounce(updateViewportIndicator, 50), [
    updateViewportIndicator,
  ])

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener("scroll", debouncedUpdateViewportIndicator)
      window.addEventListener("resize", debouncedUpdateViewportIndicator)
      updateViewportIndicator() // Initial call
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", debouncedUpdateViewportIndicator)
      }
      window.removeEventListener("resize", debouncedUpdateViewportIndicator)
    }
  }, [debouncedUpdateViewportIndicator])

  useEffect(() => {
    updateViewportIndicator()
  }, [updateViewportIndicator])

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="h-full w-full overflow-scroll no-scrollbar" ref={containerRef}>
        <div 
        className="flex h-full w-full gap-3 p-12"
        onDrop={handleColumnDragEnd}
        onDragLeave={handleColumnDragLeave}
        onDragOver={handleColumnDragOver}
        >
          <VerticalIndicator beforeId={null}/>
          {columns.map(col => (
            <React.Fragment key={col._id}>
              <Column
                boardId={board._id}
                title={col.name}
                columns={board.columns}
                // @ts-ignore
                team={board.team}
                column={col._id}
                headingColor={col.textColor}
                cards={cards}
                isDraggingColumn={isDraggingColumn}
                setIsDraggingColumn={setIsDraggingColumn}
                handleColumnDragStart={handleColumnDragStart}
                setCards={setCards}
                currentUser={{ clerkId: user?.id as string, email: user?.primaryEmailAddress?.emailAddress as string }}
              />
              <VerticalIndicator beforeId={col._id}/>
            </React.Fragment>
            ))
          }
          <div className="pr-10">
            <div className="w-full flex justify-end">
              <AddColumn boardId={board._id} setState={setColumns as unknown as React.Dispatch<SetStateAction<ColumnType[]>>}/> 
                {/* TODO: fix state */}
            </div>
            <BurnBarrel cards={board.tasks} setCards={setCards}/>
          </div>
        </div>
      </div>

      {/* Minimap */}
      <div className="fixed bottom-4 right-4 bg-neutral-800 border border-neutral-700 rounded shadow-md p-1 z-10">
        <div className="w-24 h-10 bg-neutral-800 relative">
          <div className="w-full h-10 flex gap-0.5">
            {columns.map((col, index) => (
              <div
                key={col._id}
                className="bg-neutral-700 h-full rounded-[2px]"
                style={{
                  width: `${(1 / columns.length) * 100}%`,
                }}
              />
            ))}
            <div
              style={{
                width: `${(1 / columns.length) * 100}%`,
              }}
            >
              <div className="w-full h-1 coppergroup-gradient rounded-[1px]"/>
              <div            
                className="bg-neutral-700 rounded-[1px] mt-0.5"   
                style={{
                  height: `${(1.6 / columns.length) * 100}%`,
                }}
              />
            </div>
          </div>
          <motion.div
            layout
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
              mass: 0.5,
            }}
            className="absolute top-0 bottom-0 bg-blue-500 opacity-50 rounded-[2px]"
            style={{
              left: `${viewportIndicator.left}%`,
              width: `${viewportIndicator.width}%`,
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default Board