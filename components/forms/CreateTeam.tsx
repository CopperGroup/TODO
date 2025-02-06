"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Combobox } from "@/components/ui/combobox"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlusCircle, X } from "lucide-react"
import { createTeam } from "@/lib/actions/team.actions"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

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

  const { user } = useUser()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teamName: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsCreating(true); // Initialize Creating state
    try {
      const result = await createTeam({ name: values.teamName, usersEmails: members.map((member) => member.value), adminClerkId: user?.id }, "json");
  
      setDialogOpen(false)
      form.reset();
      setMembers([]);
    } catch (error) {
      console.error("Failed to create team:", error);
    } finally {
      setIsCreating(false);
    }
  }
  
  const handleAddMember = (member: { label: string; value: string }) => {
    if (!members.some((m) => m.value === member.value)) {
      setMembers([...members, member])
    }
  }

  const handleRemoveMember = (memberValue: string) => {
    setMembers(members.filter((m) => m.value !== memberValue))
  }

  return (
    <>

      <Dialog onOpenChange={() => {form.reset(), setMembers([])}}>
        <DialogTrigger asChild >
          <Button className="coppergroup-gradient text-gray-100" onClick={() => setDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create Team
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Create New Team</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="teamName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter team name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Add Members</FormLabel>
                <Combobox
                  items={mockUsers.filter((user) => !members.some((m) => m.value === user.value))}
                  onSelect={handleAddMember}
                  placeholder="Search for members or enter email..."
                  allowCustomValue={true}
                  toastTitle="Invalid email"
                  toastDescription="Please provide a real email adress..."
                  type="Email"
                />
              </FormItem>
              {members.length > 0 && (
                <FormItem>
                  <FormLabel>Selected Members</FormLabel>
                  <ScrollArea className="h-[100px] w-full rounded-md border p-2">
                    <div className="flex flex-wrap gap-2">
                      {members.map((member) => (
                        <Badge key={member.value} variant="secondary" className="flex items-center gap-1">
                          {member.label}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0"
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
                <Button type="submit" className="coppergroup-gradient text-gray-100" disabled={isCreating}>
                  Create Team
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    
    </>
  )
}

