"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const InfoList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex w-full", className)} {...props} />,
)
InfoList.displayName = "InfoList"

const InfoListItems = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    onValueChange?: (value: string) => void
  }
>(({ className, onValueChange, ...props }, ref) => (
  <div ref={ref} className={cn("flex-shrink-0 overflow-auto", className)} {...props} />
))
InfoListItems.displayName = "InfoListItems"

const InfoListItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string
  }
>(({ className, value, ...props }, ref) => {
  const context = React.useContext(InfoListContext)
  const isSelected = context.selectedValue === value

  return (
    <div
      ref={ref}
      className={cn("cursor-pointer p-4 transition-colors hover:bg-gray-100", isSelected && "bg-gray-200", className)}
      onClick={() => context.onValueChange?.(value)}
      {...props}
    />
  )
})
InfoListItem.displayName = "InfoListItem"

const InfoListContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex-grow overflow-auto p-4", className)} {...props} />
  ),
)
InfoListContent.displayName = "InfoListContent"

type InfoListContextType = {
  selectedValue: string | null
  onValueChange?: (value: string) => void
}

const InfoListContext = React.createContext<InfoListContextType>({
  selectedValue: null,
})

const InfoListProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedValue, setSelectedValue] = React.useState<string | null>(null)

  return (
    <InfoListContext.Provider
      value={{
        selectedValue,
        onValueChange: setSelectedValue,
      }}
    >
      {children}
    </InfoListContext.Provider>
  )
}

export { InfoList, InfoListItems, InfoListItem, InfoListContent, InfoListProvider }

