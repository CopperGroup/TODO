"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ComboboxProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const Combobox = React.forwardRef<HTMLDivElement, ComboboxProps>(({ open, onOpenChange, children }, ref) => (
  <Popover open={open} onOpenChange={onOpenChange}>
    <div ref={ref} className="relative">
      {children}
    </div>
  </Popover>
))
Combobox.displayName = "Combobox"

const ComboboxTrigger = React.forwardRef<
  React.ElementRef<typeof PopoverTrigger>,
  React.ComponentPropsWithoutRef<typeof PopoverTrigger>
>(({ className, children, ...props }, ref) => (
  <PopoverTrigger asChild>
    <Button
      variant="outline"
      role="combobox"
      className={cn("w-full justify-between font-normal", className)}
      ref={ref}
      {...props}
    >
      {children}
      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  </PopoverTrigger>
))
ComboboxTrigger.displayName = "ComboboxTrigger"

const ComboboxContent = React.forwardRef<
  React.ElementRef<typeof PopoverContent>,
  React.ComponentPropsWithoutRef<typeof PopoverContent>
>(({ className, children, ...props }, ref) => (
  <PopoverContent className={cn("w-[200px] p-0", className)} ref={ref} {...props}>
    <Command className="w-full">
      <CommandList>{children}</CommandList>
    </Command>
  </PopoverContent>
))
ComboboxContent.displayName = "ComboboxContent"

const ComboboxInput = React.forwardRef<
  React.ElementRef<typeof CommandInput>,
  React.ComponentPropsWithoutRef<typeof CommandInput>
>(({ className, ...props }, ref) => <CommandInput ref={ref} className={cn("w-full", className)} {...props} />)
ComboboxInput.displayName = "ComboboxInput"

const ComboboxList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <CommandGroup ref={ref} className={cn("w-full", className)} {...props} />,
)
ComboboxList.displayName = "ComboboxList"

const ComboboxItem = React.forwardRef<
  React.ElementRef<typeof CommandItem>,
  React.ComponentPropsWithoutRef<typeof CommandItem> & { selected?: boolean }
>(({ className, children, selected, ...props }, ref) => (
  <CommandItem ref={ref} className={cn("w-full cursor-pointer", className)} {...props}>
    {children}
    {selected && <Check className={cn("ml-auto h-4 w-4")} />}
  </CommandItem>
))
ComboboxItem.displayName = "ComboboxItem"

const ComboboxEmpty = React.forwardRef<
  React.ElementRef<typeof CommandEmpty>,
  React.ComponentPropsWithoutRef<typeof CommandEmpty>
>(({ className, ...props }, ref) => (
  <CommandEmpty ref={ref} className={cn("w-full py-6 text-center text-sm", className)} {...props} />
))
ComboboxEmpty.displayName = "ComboboxEmpty"

export { Combobox, ComboboxTrigger, ComboboxContent, ComboboxInput, ComboboxList, ComboboxItem, ComboboxEmpty }

