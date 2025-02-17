"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  InfoList,
  InfoListItems,
  InfoListItem,
  InfoListContent,
  InfoListProvider,
} from "@/components/ui/info-list";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateTaskColumn } from "@/lib/actions/task.actions";
import { LayoutDashboard } from "lucide-react";
import InfoListAttachment from "./InfoListAttachment";
import { TeamTasks } from "@/lib/types";

interface TaskBoardProps {
  stringifiedTeam: string;
  currentUser: { clerkId: string; email: string };
}

const TaskBoard: React.FC<TaskBoardProps> = ({ stringifiedTeam, currentUser }) => {
  const [selectedTask, setSelectedTask] = useState<TeamTasks["tasks"][number] | null>(null);
  const [team, setTeam] = useState<TeamTasks>(JSON.parse(stringifiedTeam));

  console.log(team);

  const boards = team.tasks.reduce(
    (
      acc: Record<
        string,
        {
          _id: string;
          name: string;
          columns: TeamTasks["boards"][number]["columns"];
          tasks: TeamTasks["tasks"];
        }
      >,
      task: TeamTasks["tasks"][number]
    ) => {
      const boardId = task.board?._id || "Backlog";
      if (!acc[boardId]) {
        acc[boardId] = {
          ...task.board,
          tasks: [],
          columns: task.board?.columns || [],
        };
      }
      acc[boardId].tasks.push(task);
      return acc;
    },
    {}
  );

  const boardIds = Object.keys(boards);
  const [currentBoardId, setCurrentBoardId] = useState(boardIds[0]);

  const handleColumnChange = async (taskId: string, columnId: string) => {
    const updatedTask = team.tasks.find((task: { _id: string; }) => task._id === taskId);
    if (updatedTask) {
      const newTask = {
        ...updatedTask,
        column: boards[currentBoardId].columns.find((col: { _id: string; }) => col._id === columnId) || null,
      };

      await updateTaskColumn({ taskId: updatedTask._id, columnId });
    }
  };

  const onUpdate = (task: TeamTasks["tasks"][number]) => {
    setSelectedTask(task)
    setTeam((prevTeam) => ({
      ...prevTeam,
      tasks: prevTeam.tasks.map((t) =>
        t._id === task._id ? task : t
      ),
    }));
  }

  return (
    <div className="w-full h-full bg-gray-100">
      <Tabs defaultValue={currentBoardId} className="w-full h-full" onValueChange={setCurrentBoardId}>
        <TabsList className="w-full bg-white border-b border-b-transparent px-4 flex gap-2 rounded-none">
          {boardIds.map((boardId) => (
            <TabsTrigger
              key={boardId}
              value={boardId}
              className="px-4 py-2 text-sm font-medium rounded-none text-gray-700 hover:text-gray-900 whitespace-nowrap data-[state=active]:shadow-none data-[state=active]:bg-transparent data-[state=active]:border-0 data-[state=active]:border-b data-[state=active]:border-black"
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              {boards[boardId]?.name || "Backlog"}
            </TabsTrigger>
          ))}
        </TabsList>
        {boardIds.map((boardId) => (
          <TabsContent key={boardId} value={boardId} className="p-0 h-[calc(100vh-48px)] mt-0">
            <InfoListProvider>
              <InfoList className="h-full flex">
                <InfoListItems
                  className={`bg-white border-r border-gray-200 transition-all duration-300 ${
                    selectedTask ? "w-1/3" : "w-full"
                  }`}
                >
                  <ScrollArea className="h-full">
                    {boards[boardId].tasks.map((task) => {
                      if(!task.parentId) {
                        return (
                          <InfoListItem
                            key={task._id}
                            value={task._id}
                            onClick={() => setSelectedTask((prev) => (prev?._id === task._id ? null : task))}
                            className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ease-in-out"
                          >
                            <div className="flex items-center justify-between space-x-3">
                              <div className="flex items-center space-x-3 flex-grow">
                                <div
                                  className={`w-3 h-3 rounded-full ${
                                    task.type === "Bug" ? "bg-red-500" : "bg-blue-500"
                                  }`}
                                />
                                <h3 className="font-medium text-gray-900 truncate">{task.description}</h3>
                              </div>
                              <Select defaultValue={task.column?._id} onValueChange={(value) => handleColumnChange(task._id, value)}>
                                <SelectTrigger className="h-7 w-[120px] text-xs bg-gray-50 border-zinc-200 focus:ring-blue-500">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-neutral-800 border-zinc-700 focus:ring-blue-500">
                                  {boards[boardId].columns.map((column) => (
                                    <SelectItem
                                      className="text-xs font-medium focus:bg-neutral-700"
                                      key={column._id}
                                      value={column._id}
                                      style={{ color: column.textColor }}
                                    >
                                      {column.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                              <span>{task.column?.name}</span>
                              <div className="flex -space-x-1">
                                {task.assignedTo.slice(0, 3).map((assignee) => (
                                  <img
                                    key={assignee._id}
                                    className="w-6 h-6 rounded-full border-2 border-white"
                                    src={assignee.profilePicture || "/placeholder.svg"}
                                    alt={assignee.name}
                                  />
                                ))}
                                {task.assignedTo.length > 3 && (
                                  <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-500">
                                    +{task.assignedTo.length - 3}
                                  </div>
                                )}
                              </div>
                            </div>
                          </InfoListItem>
                        )
                      }
                    })}
                  </ScrollArea>
                </InfoListItems>
                {selectedTask && (
                  <InfoListContent className="flex-1 bg-white">
                    <InfoListAttachment
                      task={selectedTask}
                      columns={boards[currentBoardId].columns}
                      team={team}
                      currentUser={currentUser}
                      onClose={() => setSelectedTask(null)}
                      onUpdate={onUpdate}
                      allTasks={team.tasks}
                      boardId={currentBoardId}
                    />
                  </InfoListContent>
                )}
              </InfoList>
            </InfoListProvider>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default TaskBoard;
