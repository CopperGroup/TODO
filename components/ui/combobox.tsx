"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ToastAction } from "./toast"
import { useToast } from "@/hooks/use-toast"

interface ComboboxProps {
  items: { label: string; value: string }[]
  onSelect: (item: { label: string; value: string }) => void
  placeholder?: string
  allowCustomValue?: boolean
  toastTitle?: string, 
  toastDescription?: string,
}

export function Combobox({ items, onSelect, placeholder, allowCustomValue = false, toastTitle, toastDescription }: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const { toast } = useToast();

  const handleSelect = (currentValue: string) => {

    if(isValidEmail(currentValue)) {
      onSelect({ label: currentValue, value: currentValue })
      setInputValue("")
      setOpen(false)
    } else {
      toast({
        variant: "destructive",
        title: toastTitle || "Uh oh! Something went wrong.",
        description: toastDescription || "There was a problem with your request.",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      })
    }
  }

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const filteredItems = React.useMemo(() => {
    const filtered = items.filter(
      (item) =>
        item.label.toLowerCase().includes(inputValue.toLowerCase()) ||
        item.value.toLowerCase().includes(inputValue.toLowerCase()),
    )

    if (allowCustomValue && isValidEmail(inputValue) && !filtered.some((item) => item.value === inputValue)) {
      filtered.push({ label: inputValue, value: inputValue })
    }

    return filtered
  }, [items, inputValue, allowCustomValue, isValidEmail])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full font-medium justify-between">
          {inputValue || placeholder || "Select item..."}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search or enter email..." value={inputValue} onValueChange={setInputValue} />
          <CommandList>
            <CommandEmpty>No item found.</CommandEmpty>
            <CommandGroup>
              {filteredItems.map((item) => (
                <CommandItem key={item.value} onSelect={() => handleSelect(item.value)}>
                  <CheckIcon className={cn("mr-2 h-4 w-4", inputValue === item.value ? "opacity-100" : "opacity-0")} />
                  {item.label}
                </CommandItem>
              ))}
              {inputValue &&
                <CommandItem onSelect={() => handleSelect(inputValue)}>
                  <CheckIcon className={cn("mr-2 h-4 w-4 opacity-0")} />
                  {inputValue}
                </CommandItem>
              }
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

