import { useState } from "react";
import Column from "./Column";
import BurnBarrel from "./BurnBarrel";
import { Column as ColumnType } from "@/lib/types";
import VerticalIndicator from "./VerticalIndicator";

const DEFAULT_CARDS = [
  // BACKLOG
  { title: "Look into render bug in dashboard", id: "1", column: "backlog" },
  { title: "SOX compliance checklist", id: "2", column: "backlog" },
  { title: "[SPIKE] Migrate to Azure", id: "3", column: "backlog" },
  { title: "Document Notifications service", id: "4", column: "backlog" },
  // TODO
  {
    title: "Research DB options for new microservice",
    id: "5",
    column: "todo",
  },
  { title: "Postmortem for outage", id: "6", column: "todo" },
  { title: "Sync with product on Q3 roadmap", id: "7", column: "todo" },

  // DOING
  {
    title: "Refactor context providers to use Zustand",
    id: "8",
    column: "doing",
  },
  { title: "Add logging to daily CRON", id: "9", column: "doing" },
  // DONE
  {
    title: "Set up DD dashboards for Lambda listener",
    id: "10",
    column: "done",
  },
];

const DEFAULT_COLUMNS = [
  { id: "backlog", title: "Backlog", headingColor: "text-neutral-500", position: "1" },
  { id: "todo", title: "TODO", headingColor: "text-yellow-200", position: "2" },
  { id: "doing", title: "In Progress", headingColor: "text-blue-200", position: "3" },
  { id: "done", title: "Complete", headingColor: "text-emerald-200", position: "4" },
];


const Board = () => {
  const [ cards, setCards ] = useState(DEFAULT_CARDS);
  const [ columns, setColumns ] = useState(DEFAULT_COLUMNS);
  const [ isDraggingColumn, setIsDraggingColumn ] = useState(false)

  const handleColumnDragStart = (e: any, columnId: string) => {
    e.dataTransfer.setData("columnId", columnId);
    setIsDraggingColumn(true)
  };

  return (
    <div className="flex h-full w-full gap-3 overflow-scroll p-12 custom-scrollbar">
      {columns.map(col => (
        <>
          <VerticalIndicator 
            beforeId={col.position}
            column={col.id}
          />
          <Column
            title={col.title}
            column={col.id}
            headingColor={col.headingColor}
            cards={cards}
            draggingColumn={isDraggingColumn}
            handleColumnDragStart={handleColumnDragStart}
            setCards={setCards}
          />
        </>
        ))
      }
       {/* <Column
        title="Backlog"
        column="backlog"
        headingColor="text-neutral-500"
        cards={cards}
        setCards={setCards}
      />
      
      <Column
        title="TODO"
        column="todo"
        headingColor="text-yellow-200"
        cards={cards}
        setCards={setCards}
      />

      <Column
        title="In progress"
        column="doing"
        headingColor="text-blue-200"
        cards={cards}
        setCards={setCards}
      />

      <Column
        title="Complete"
        column="done"
        headingColor="text-emerald-200"
        cards={cards}
        setCards={setCards}
      /> */}

      <BurnBarrel setCards={setCards}/>
    </div>
  )
}

export default Board