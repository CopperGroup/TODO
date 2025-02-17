import type React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { TeamTasks } from "@/lib/types";
import { ChevronDown } from "lucide-react";

interface SubtaskListProps {
  subtasks: TeamTasks["tasks"][number]["subTasks"];
  onColumnChange: (subtaskId: string, column: string) => void;
  value: string;
  setSubtaskAcorditionValue: React.Dispatch<React.SetStateAction<string>>;
  columns: TeamTasks["boards"][number]["columns"];
}

const SubtaskList: React.FC<SubtaskListProps> = ({
  subtasks,
  onColumnChange,
  value,
  setSubtaskAcorditionValue,
  columns,
}) => {

  console.log(subtasks)
  return (
    <Accordion type="single" collapsible className="w-full" value={value}>
      <AccordionItem value="subtasks" className="border-none">
        <AccordionTrigger
          className="text-lg font-semibold text-gray-900 hover:no-underline"
          onClick={() => setSubtaskAcorditionValue(value === "subtasks" ? "" : "subtasks")}
        >
          Subtasks ({subtasks.length})
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200" />
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 mt-2">
            {subtasks.map((subtask) => (
              <div
                key={subtask._id}
                className="flex items-center justify-between gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex items-center gap-3 flex-grow">
                  <Badge
                    className={`${
                      subtask.type === "Bug" ? "bg-red-100 text-red-800 hover:bg-red-200" : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                    } text-xs px-2 py-1`}
                  >
                    {subtask.type}
                  </Badge>
                  <span className="text-gray-700 text-sm">{subtask.description}</span>
                </div>
                <div className="flex items-center gap-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex -space-x-2">
                          {subtask.assignedTo.slice(0, 2).map((assignee, index) => (
                            <Avatar key={index} className="w-6 h-6 border-2 border-white">
                              <AvatarImage src={assignee.profilePicture || ""} />
                              <AvatarFallback>{assignee.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          ))}
                          {subtask.assignedTo.length > 2 && (
                            <Avatar className="w-6 h-6 bg-gray-200 text-gray-600 border-2 border-white">
                              <AvatarFallback>+{subtask.assignedTo.length - 2}</AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Assignees</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Select
                    defaultValue={subtask.column}
                    onValueChange={(value) => onColumnChange(subtask._id, value)}
                  >
                    <SelectTrigger className="h-7 w-[120px] text-xs bg-gray-50 border-zinc-200 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-800 border-zinc-700 focus:ring-blue-500">
                      {columns.map((column) => (
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
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default SubtaskList;
