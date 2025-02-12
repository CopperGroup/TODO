"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import {
  Combobox,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxInput,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlusCircle, X, User } from "lucide-react"
import { createTeam } from "@/lib/actions/team.actions"
import { useUser } from "@clerk/nextjs"
import { useToast } from "@/hooks/use-toast"

// Mock user data for suggestions
const mockUsers = [
  { label: "Alice Johnson", value: "alice@example.com" },
  { label: "Bob Smith", value: "bob@example.com" },
  { label: "Charlie Brown", value: "charlie@example.com" },
  { label: "Diana Ross", value: "diana@example.com" },
  { label: "Edward Norton", value: "edward@example.com" },
]

const formSchema = z.object({
  teamName: z.string().min(2, {
    message: "Team name must be at least 2 characters.",
  }),
})

export default function CreateTeamForm() {
  const [members, setMembers] = useState<{ label: string; value: string }[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [comboboxOpen, setComboboxOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")

  const { user } = useUser()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teamName: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsCreating(true)
    try {
      await createTeam(
        { name: values.teamName, usersEmails: members.map((member) => member.value), adminClerkId: user?.id, plan: "free_plan"},
        "json",
      )
      setDialogOpen(false)
      form.reset()
      setMembers([])
      toast({
        title: "Team created",
        description: "Your new team has been created successfully.",
      })
    } catch (error) {
      console.error("Failed to create team:", error)
      toast({
        title: "Error",
        description: "Failed to create team. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
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

  const filteredItems = mockUsers.filter(
    (item) =>
      !members.some((m) => m.value === item.value) &&
      (item.label.toLowerCase().includes(inputValue.toLowerCase()) ||
        item.value.toLowerCase().includes(inputValue.toLowerCase())),
  )

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button
            className="coppergroup-gradient text-gray-100"
            onClick={() => setDialogOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Create Team
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Create New Team</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="teamName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter team name" className="w-full" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Add Members</FormLabel>
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
                          onSelect={() => handleAddMember(item)}
                          className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <User className="mr-2 h-4 w-4" />
                          <span>{item.label}</span>
                          <span className="ml-auto text-sm text-gray-500">{item.value}</span>
                        </ComboboxItem>
                      ))}
                      {isValidEmail(inputValue) && !filteredItems.some((item) => item.value === inputValue) && (
                        <ComboboxItem
                          value={inputValue}
                          onSelect={() => handleAddMember({ label: inputValue, value: inputValue })}
                          className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          <span>Add &quot;{inputValue}</span>
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </FormItem>
              {members.length > 0 && (
                <FormItem>
                  <FormLabel>Selected Members</FormLabel>
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
                </FormItem>
              )}
              <DialogFooter>
                <Button
                  type="submit"
                  className="w-full coppergroup-gradient text-gray-100"
                  disabled={isCreating}
                >
                  {isCreating ? "Creating..." : "Create Team"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
