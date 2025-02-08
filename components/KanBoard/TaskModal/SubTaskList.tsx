"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { PopulatedColumnType, PopulatedTaskType } from "@/lib/types"
import { ChevronDown } from "lucide-react"
import { SetStateAction } from "react"

interface SubtaskListProps {
  subtasks: PopulatedTaskType[]
  onColumnChange: (subtaskId: string, column: string) => void,
  value: string
  setSubtaskAcorditionValue: React.Dispatch<SetStateAction<string>>
  columns: PopulatedColumnType[],
}

export default function SubtaskList({ subtasks, onColumnChange, value, setSubtaskAcorditionValue, columns }: SubtaskListProps) {

  return (
    <Accordion type="single" collapsible className="w-full border-zinc-800" value={value}>
      <AccordionItem value="subtasks" className="border-0">
        <AccordionTrigger className="text-lg font-semibold text-zinc-100 hover:no-underline" onClick={() => setSubtaskAcorditionValue(value === "subtasks" ? "" : "subtasks")}>
            Subtasks ({subtasks.length})
            <ChevronDown className="h-4 w-4 shrink-0 text-zinc-100 transition-transform duration-200" />
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            {subtasks.map((subtask) => (
              <div key={subtask._id} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-zinc-800/50">
                <Badge
                  className={`${
                    subtask.type === "Bug" ? "bg-red-500 hover:bg-red-600" : "bg-neutral-500 hover:bg-neutral-400"
                  } text-center`}
                >
                  {subtask.type}
                </Badge>
                <span className="text-zinc-300 flex-grow">{subtask.description}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex -space-x-2">
                        {subtask.assignedTo.slice(0, 2).map((assignee, index) => (
                          <Avatar key={index} className="w-6 h-6 border-2 border-neutral-400">
                            <AvatarImage src={assignee.profilePicture} />
                            <AvatarFallback>{assignee.name[0]}</AvatarFallback>
                          </Avatar>
                        ))}
                        {subtask.assignedTo.length > 2 && (
                          <Avatar className="w-6 h-6 bg-zinc-700 text-white border-2 border-white">
                            <AvatarFallback>
                              {subtask.assignedTo.length === 3 ? (
                                <AvatarImage src={subtask.assignedTo[2].profilePicture} />
                              ) : (
                                `+${subtask.assignedTo.length - 2}`
                              )}
                            </AvatarFallback>
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
                  defaultValue={subtask.column as string}
                  onValueChange={(value) => onColumnChange(subtask._id, value)}
                >
                  <SelectTrigger className="h-7 w-[120px] text-xs bg-zinc-800/50 border-zinc-700 focus:ring-blue-500" style={{ color: columns.find(col => col._id === subtask.column as string)?.textColor || "#f4f4f5"}}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-zinc-700 focus:ring-blue-500">
                    {columns.map((column) => (
                      <SelectItem className="text-xs font-medium focus:bg-neutral-700" key={column._id} value={column._id} style={{ color: column.textColor }}>
                        {column.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

