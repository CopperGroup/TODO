"use client"

import { useState } from "react"
import { FiPlusCircle } from "react-icons/fi"
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
import type { PopulatedTeamType } from "@/lib/types"

interface UserSelectionComboboxProps {
  team: PopulatedTeamType
  onUserSelect: (userId: string) => void
}

const UserSelectionCombobox: React.FC<UserSelectionComboboxProps> = ({ team, onUserSelect }) => {
  const [assigneeInput, setAssigneeInput] = useState("")
  const [comboboxOpen, setComboboxOpen] = useState(false)

  const filteredUsers = team.users.filter((member) =>
    member.user.name.toLowerCase().includes(assigneeInput.toLowerCase()),
  )

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  return (
    <Combobox open={comboboxOpen} onOpenChange={setComboboxOpen}>
      <ComboboxTrigger className="w-full">{assigneeInput || "Search for members or enter email..."}</ComboboxTrigger>
      <ComboboxContent className="w-[400px] p-0">
        <ComboboxInput
          placeholder="Search for members or enter email..."
          value={assigneeInput}
          onValueChange={setAssigneeInput}
          className="w-full border-b p-2"
        />
        <ComboboxList className="max-h-[200px] overflow-y-auto">
          {filteredUsers.length === 0 && !isValidEmail(assigneeInput) && (
            <ComboboxEmpty>No members found.</ComboboxEmpty>
          )}
          {filteredUsers.map((user) => (
            <ComboboxItem
              key={user.user._id}
              value={user.user._id}
              onSelect={() => onUserSelect(user.user._id)}
              className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Avatar className="w-6 h-6 mr-2">
                <AvatarImage src={user.user.profilePicture} alt={user.user.name} />
                <AvatarFallback>{user.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>{user.user.name}</span>
              <span className="ml-auto text-sm text-gray-500">{user.user.email}</span>
            </ComboboxItem>
          ))}
          {isValidEmail(assigneeInput) && !filteredUsers.some((user) => user.user.email === assigneeInput) && (
            <ComboboxItem
              value={assigneeInput}
              onSelect={() => onUserSelect(assigneeInput)}
              className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <FiPlusCircle className="mr-2 h-4 w-4" />
              <span>Invite "{assigneeInput}"</span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export default UserSelectionCombobox

