"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus, Copy, User, X } from "lucide-react"
import {
  Combobox,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxInput,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { addInvitees } from "@/lib/actions/team.actions"

type Member = {
  _id: string
  name: string
  email: string
}

type AddMembersProps = {
  teamId: string
  isAdmin: boolean
  existingMembers: Member[]
}

export default function AddMembers({ teamId, isAdmin, existingMembers }: AddMembersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [members, setMembers] = useState<{ label: string; value: string }[]>([])
  const [comboboxOpen, setComboboxOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const { toast } = useToast()

  const inviteLink = `https://thekolos.vercel.app/join/${teamId}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink)
    toast({
      title: "Link copied",
      description: "Invite link has been copied to clipboard.",
    })
  }

  const handleAddMember = (member: { label: string; value: string }) => {
    if (!members.some((m) => m.value === member.value)) {
      setMembers([...members, member])
      setInputValue("")
      setComboboxOpen(false)
    }
  }

  const handleRemoveMember = (memberValue: string) => {
    setMembers(members.filter((m) => m.value !== memberValue))
  }

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const filteredItems = [
    ...existingMembers.map((member) => ({ label: member.name, value: member.email, existing: true })),
    ...members.map((member) => ({ ...member, existing: false })),
  ].filter(
    (item) =>
      item.label.toLowerCase().includes(inputValue.toLowerCase()) ||
      item.value.toLowerCase().includes(inputValue.toLowerCase()),
  )

  const handleAddMembers = async () => {
    // Here you would typically call an API to add the members

    const emails = members.map(m => m.value);

    console.log("Adding members:", members)
    handleCopyLink()
    setIsOpen(false)
    setMembers([])

    await addInvitees({ teamId, invitedEmailsList: emails })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Members
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Team Members</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="invite-link">Invite Link</Label>
            <div className="flex mt-1">
              <Input id="invite-link" value={inviteLink} className="flex-grow" readOnly disabled />
              <Button onClick={handleCopyLink} className="ml-2">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {isAdmin && (
            <>
              <div>
                <Label>Add Members</Label>
                <p className="text-xs pt-1 pb-2">Add emails, so that new members can join without request</p>
                <Combobox open={comboboxOpen} onOpenChange={setComboboxOpen}>
                  <ComboboxTrigger className="w-full">
                    {inputValue || "Search for members or enter email..."}
                  </ComboboxTrigger>
                  <ComboboxContent className="w-[400px] p-0">
                    <ComboboxInput
                      placeholder="Search for members or enter email..."
                      value={inputValue}
                      onValueChange={setInputValue}
                      className="w-full border-b p-2"
                    />
                    <ComboboxList className="max-h-[200px] overflow-y-auto">
                      {filteredItems.length === 0 && !isValidEmail(inputValue) && (
                        <ComboboxEmpty>No members found.</ComboboxEmpty>
                      )}
                      {filteredItems.map((item) => (
                        <ComboboxItem
                          key={item.value}
                          value={item.value}
                          onSelect={() => !item.existing && handleAddMember(item)}
                          className={`flex items-center p-2 ${
                            item.existing ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                          disabled={item.existing}
                        >
                          <User className="mr-2 h-4 w-4" />
                          <span>{item.label}</span>
                          <span className="ml-auto text-sm text-gray-500">{item.value}</span>
                          {item.existing && <span className="ml-2 text-xs text-gray-500">(Here)</span>}
                        </ComboboxItem>
                      ))}
                      {isValidEmail(inputValue) && !filteredItems.some((item) => item.value === inputValue) && (
                        <ComboboxItem
                          value={inputValue}
                          onSelect={() => handleAddMember({ label: inputValue, value: inputValue })}
                          className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          <span>Add "{inputValue}"</span>
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
              {members.length > 0 && (
                <div>
                  <Label>Selected Members</Label>
                  <ScrollArea className="h-[100px] w-full rounded-md border p-2">
                    <div className="flex flex-wrap gap-2">
                      {members.map((member) => (
                        <Badge key={member.value} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                          <User className="h-3 w-3" />
                          <span className="text-sm">{member.label}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => handleRemoveMember(member.value)}
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove {member.label}</span>
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
              <DialogFooter>
                <Button onClick={handleAddMembers} disabled={members.length === 0}>
                  Add Members
                </Button>
              </DialogFooter>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

