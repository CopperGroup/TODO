"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

type TimeSelectContextValue = {
  value: string
  onSelect: (time: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const TimeSelectContext = React.createContext<TimeSelectContextValue | undefined>(undefined)

function useTimeSelect() {
  const context = React.useContext(TimeSelectContext)
  if (!context) {
    throw new Error("useTimeSelect must be used within a TimeSelect")
  }
  return context
}

interface TimeSelectProps {
  value: string
  onSelect: (time: string) => void
  children: React.ReactNode
}

export function TimeSelect({ value, onSelect, children }: TimeSelectProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <TimeSelectContext.Provider value={{ value, onSelect, open, setOpen }}>
      <Popover open={open} onOpenChange={setOpen}>
        {children}
      </Popover>
    </TimeSelectContext.Provider>
  )
}

interface TimeSelectTriggerProps {
  className?: string
  children?: React.ReactNode
}

export function TimeSelectTrigger({ className, children }: TimeSelectTriggerProps) {
  const { value, open } = useTimeSelect()

  return (
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className={cn("w-full justify-between bg-white border-gray-300 text-gray-800 hover:bg-gray-100", className)}
      >
        {children || value || "Select time..."}
        <Clock className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
  )
}

interface TimeSelectContentProps {
  className?: string
}

export function TimeSelectContent({ className }: TimeSelectContentProps) {
  const { onSelect, setOpen } = useTimeSelect()
  const [selectedHour, setSelectedHour] = React.useState<number | null>(null)
  const [selectedMinute, setSelectedMinute] = React.useState<number | null>(null)

  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = Array.from({ length: 60 }, (_, i) => i)

  const handleSelect = (type: "hour" | "minute", value: number) => {
    if (type === "hour") {
      setSelectedHour(value)
    } else {
      setSelectedMinute(value)
    }

    if (selectedHour !== null && type === "minute") {
      const timeString = `${selectedHour.toString().padStart(2, "0")}:${value.toString().padStart(2, "0")}`
      onSelect(timeString)
      setOpen(false)
    }
  }

  return (
    <PopoverContent className={cn("w-[180px] p-0 bg-white border-gray-300", className)}>
      <div className="flex divide-x divide-gray-200">
        <ScrollArea className="w-1/2 h-[200px]">
          <div className="px-1">
            {hours.map((hour) => (
              <button
                key={hour}
                className={cn(
                  "w-full px-2 py-1 text-sm text-left hover:bg-gray-100 transition-colors rounded-sm",
                  selectedHour === hour && "bg-blue-50 text-blue-600 font-medium",
                )}
                onClick={() => handleSelect("hour", hour)}
              >
                {hour.toString().padStart(2, "0")}
              </button>
            ))}
          </div>
        </ScrollArea>
        <ScrollArea className="w-1/2 h-[200px]">
          <div className="px-1">
            {minutes.map((minute) => (
              <button
                key={minute}
                className={cn(
                  "w-full px-2 py-1 text-sm text-left hover:bg-gray-100 transition-colors rounded-sm",
                  selectedMinute === minute && "bg-blue-50 text-blue-600 font-medium",
                )}
                onClick={() => handleSelect("minute", minute)}
              >
                {minute.toString().padStart(2, "0")}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </PopoverContent>
  )
}

