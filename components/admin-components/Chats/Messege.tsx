"use client"

import { Messege, MessegeContent } from "@/components/ui/chat"
import type { TeamPopulatedChatsType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { performRequestAction } from "@/lib/actions/team.actions"
import { lowercaseFirstLetter } from "@/lib/utils"
import { useState } from "react"

export default function MessegeItem({
  messege,
  clerkId,
  teamId
}: {
  messege: TeamPopulatedChatsType["chats"][number]["messeges"][number]
  clerkId: string,
  teamId: string
}) {
  const [messegeType, setMessegeType] = useState(messege.type)
  const isOwnMessege = messege.sender.clerkId === clerkId

  const handleRequestAction = async (action: "Accept" | "Refuse") => {
    setMessegeType(`Request-${lowercaseFirstLetter(action)}`)

    await performRequestAction({ teamId, messegeContent: messege.content, messegeId: messege._id, action})
  }

  return (
    <Messege
      key={messege._id}
      className={`flex ${isOwnMessege ? "justify-end" : "justify-start"} mb-6 max-w-[80%] ${isOwnMessege ? "ml-auto" : "mr-auto"}`}
    >
      <div className={`flex ${isOwnMessege ? "flex-row-reverse" : "flex-row"} items-start gap-3`}>
        <Avatar className="w-10 h-10">
          <AvatarImage src={messege.sender.profilePicture || "/default-avatar.png"} alt={messege.sender.name} />
          <AvatarFallback>{messege.sender.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className={`flex flex-col ${isOwnMessege ? "items-end" : "items-start"}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900">{messege.sender.name}</span>
            <span className="text-xs text-gray-500">{format(new Date(messege.createdAt), "MMM d, h:mm a")}</span>
          </div>
          <MessegeContent
            className={`p-3 rounded-lg shadow-sm ${
              isOwnMessege ? "bg-zinc-800 text-white rounded-tr-none" : "bg-gray-100 text-gray-900 rounded-tl-none"
            }`}
          >
            {messegeType === "Default" ? (
              <p className="whitespace-pre-wrap">{messege.content}</p>
            ) : (
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: messege.content }} />
            )}
          </MessegeContent>
          {messegeType === "Request" && (
            <div className="flex space-x-2 mt-2">
              <Button variant="destructive" size="sm" onClick={() => handleRequestAction("Refuse")}>
                Refuse
              </Button>
              <Button variant="default" size="sm" onClick={() => handleRequestAction("Accept")}>
                Accept
              </Button>
            </div>
          )}
          {messegeType === "Request-accepted" && (
            <div className="mt-2">
              <Button variant="default" size="sm" disabled>
                Accepted
              </Button>
            </div>
          )}
          {messegeType === "Request-refused" && (
            <div className="mt-2">
              <Button variant="destructive" size="sm" disabled>
                Refused
              </Button>
            </div>
          )}
        </div>
      </div>
    </Messege>
  )
}

