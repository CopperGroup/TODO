"use client"

import type React from "react"

import { useState } from "react"
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxEmpty,
} from "@/components/ui/combobox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { TeamMeetingsType } from "@/lib/types"
import { UserType } from "@/lib/models/user.model"

interface UserSelectionComboboxProps {
  team: TeamMeetingsType
  assignees: UserType[]
  onUserSelect: (user: UserType) => void
}

const UserSelectionCombobox: React.FC<UserSelectionComboboxProps> = ({ team, assignees, onUserSelect }) => {
  const [assigneeInput, setAssigneeInput] = useState("")
  const [comboboxOpen, setComboboxOpen] = useState(false)

  const filteredUsers = team.members.filter((member) => {
    const searchInput = assigneeInput.toLowerCase()
    return (
      !assignees.some((a) => a._id === member.user._id) &&
      (member.user.name.toLowerCase().includes(searchInput) || member.user.email.toLowerCase().includes(searchInput))
    )
  })

  return (
    <Combobox open={comboboxOpen} onOpenChange={setComboboxOpen}>
      <ComboboxTrigger className="w-full bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400 border p-2 hover:bg-neutral-600 hover:text-white">
        {assigneeInput || "Search for members..."}
      </ComboboxTrigger>
      <ComboboxContent className="w-full p-0">
        <ComboboxInput
          placeholder="Search for members..."
          value={assigneeInput}
          onValueChange={setAssigneeInput}
          className="w-full p-2"
        />
        <ComboboxList className="max-h-[200px] overflow-y-auto">
          {filteredUsers.length === 0 && (
            <ComboboxEmpty className="p-2">No members found.</ComboboxEmpty>
          )}
          {filteredUsers.map((member) => (
            <ComboboxItem
              key={member.user._id}
              value={member.user.email}
              onSelect={() => {
                onUserSelect(member.user)
                setAssigneeInput("")
                setComboboxOpen(false)
              }}
              className="flex items-center p-2 hover:bg-neutral-700"
            >
              <Avatar className="w-6 h-6 mr-2">
                <AvatarImage src={member.user.profilePicture || ""} alt={member.user.name} />
                <AvatarFallback>{member.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{member.user.name}</span>
              <span className="ml-auto text-xs text-gray-500">{member.user.email}</span>
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export default UserSelectionCombobox

