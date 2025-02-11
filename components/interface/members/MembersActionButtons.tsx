"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { UserMinus } from "lucide-react"
import { kickUserOut } from "@/lib/actions/team.actions"
import { useToast } from "@/hooks/use-toast"

type ActionButtonsProps = {
  teamId: string,
  memberId: string
  role: "Admin" | "Member"
  isAdmin: boolean
}

export default function MembersActionButtons({ teamId, memberId, role, isAdmin }: ActionButtonsProps) {
  const [isRemoveMemberOpen, setIsRemoveMemberOpen] = useState(false)
  const [removeConfirmation, setRemoveConfirmation] = useState("")
  const [loading, setLoading] = useState(false) // Loading state
  const [error, setError] = useState<string | null>(null) // Error state
  const { toast } = useToast()

  const handleRemoveMember = async () => {
    if (removeConfirmation === "confirm") {
      setLoading(true)
      setError(null)

      try {
        await kickUserOut({ teamId, userId: memberId })

        setIsRemoveMemberOpen(false)
        setRemoveConfirmation("")
        setLoading(false)

        toast({
          title: "Member Removed",
          description: "The member has been successfully removed from the team.",
        })
      } catch (err: any) {
        setLoading(false) // Stop loading
        setError("Failed to remove member. Please try again.") // Set error message

        toast({
          title: "Error",
          description: "There was an error removing the member.",
          variant: "destructive",
        })
      }
    }
  }

  if (role === "Admin" || !isAdmin) return null

  return (
    <Dialog open={isRemoveMemberOpen} onOpenChange={setIsRemoveMemberOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={loading}>
          <UserMinus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-neutral-800 text-white border-neutral-700">
        <DialogHeader>
          <DialogTitle>Remove Team Member</DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-neutral-400">
          Are you sure you want to remove this member from the team?
        </DialogDescription>
        <p className="text-neutral-400">Type 'confirm' to proceed:</p>
        <Input
          value={removeConfirmation}
          onChange={(e) => setRemoveConfirmation(e.target.value)}
          placeholder="Type 'confirm'"
          className="bg-neutral-700 text-white border-neutral-600"
        />
        <Button
          onClick={handleRemoveMember}
          disabled={removeConfirmation !== "confirm" || loading}
          variant="destructive"
          className="mt-2 bg-red-600 hover:bg-red-700 text-white"
        >
          {loading ? "Removing..." : "Remove Member"}
        </Button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </DialogContent>
    </Dialog>
  )
}
