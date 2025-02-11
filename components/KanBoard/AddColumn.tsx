"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { PlusCircle } from "lucide-react"
import { createColumn } from "@/lib/actions/column.action"
import { useTeamPlan } from "@/app/dashboard/team/[id]/TeamPlanProvider"

interface Column {
  _id: string
  name: string
  textColor: string
}

interface ColumnColorPickerProps {
  boardId: string,
  setState: React.Dispatch<React.SetStateAction<Column[]>>  // Updated this to match the state setter type
}

export function AddColumn({ boardId, setState }: ColumnColorPickerProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)  // Error state for displaying validation messages
  const form = useForm({
    defaultValues: {
      name: "",
    },
  })

  const forbiddenNames = ["Backlog", "TODO", "In Progress", "Done"]  // Forbidden column names

  const onSubmit = async (data: { name: string }) => {
    if (forbiddenNames.includes(data.name)) {
      setError("This name is reserved. Please choose a different one.")  // Show error message
      return
    }

    const result = await createColumn({ name: data.name, boardId }, 'json')

    setState((prevColumns) => [
      JSON.parse(result),
      ...prevColumns,
    ])
    setOpen(false)
    setError(null)  // Reset error when submission is successful
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full coppergroup-gradient text-gray-100 hover:text-gray-300">
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Column
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Column</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Column Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter column name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            {error && <p className="text-red-500 text-xs mt-2 ml-2">{error}</p>}  {/* Show error message */}
            <Button type="submit" className="coppergroup-gradient text-gray-100 mt-4">Add Column</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
