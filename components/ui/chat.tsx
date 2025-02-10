"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "./input"
import { Button } from "./button"

interface ChatMessege {
  id: string
  content: string
  sender: string
  timestamp: string
}

interface ChatData {
  id: string
  name: string
  avatar: string
  lastMessege: string
  timestamp: string
  unreadCount: number
  messeges: ChatMessege[]
}

const Chat = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const [selectedChat, setSelectedChat] = React.useState<ChatData | null>(null)

    return (
      <div ref={ref} className={cn("flex h-screen", className)} {...props}>
      </div>
    )
  },
)
Chat.displayName = "Chat"

const ChatList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex-shrink-0 overflow-y-auto", className)} {...props} />
  ),
)
ChatList.displayName = "ChatList"

const ChatListItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-3 cursor-pointer hover:bg-accent", className)} {...props} />
  ),
)
ChatListItem.displayName = "ChatListItem"

const ChatListItemProfileImage = React.forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(
  ({ className, ...props }, ref) => (
    <img ref={ref} className={cn("w-10 h-10 rounded-full mr-3", className)} {...props} />
  ),
)
ChatListItemProfileImage.displayName = "ChatListItemProfileImage"

const ChatListItemHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("font-semibold", className)} {...props} />,
)
ChatListItemHeader.displayName = "ChatListItemHeader"

const ChatListItemLastMessegePreview = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground truncate", className)} {...props} />
))
ChatListItemLastMessegePreview.displayName = "ChatListItemLastMessegePreview"

const ChatListItemTimeStamp = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={cn("text-xs text-muted-foreground", className)} {...props} />
  ),
)
ChatListItemTimeStamp.displayName = "ChatListItemTimeStamp"

const ChatListItemUnreadCount = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn("bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs", className)}
      {...props}
    />
  ),
)
ChatListItemUnreadCount.displayName = "ChatListItemUnreadCount"

const ChatWrapper = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex-grow flex flex-col", className)} {...props} />,
)
ChatWrapper.displayName = "ChatWrapper"

const ChatHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-3 border-b", className)} {...props} />
  ),
)
ChatHeader.displayName = "ChatHeader"

const ChatHeaderProfileImage = React.forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(
  ({ className, ...props }, ref) => (
    <img ref={ref} className={cn("w-10 h-10 rounded-full mr-3", className)} {...props} />
  ),
)
ChatHeaderProfileImage.displayName = "ChatHeaderProfileImage"

const ChatHeaderName = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => <h2 ref={ref} className={cn("font-semibold", className)} {...props} />,
)
ChatHeaderName.displayName = "ChatHeaderName"

const ChatHeaderLastSeen = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
)
ChatHeaderLastSeen.displayName = "ChatHeaderLastSeen"

const CloseChat = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button ref={ref} className={cn("ml-auto p-2 rounded-full hover:bg-accent", className)} {...props} />
  ),
)
CloseChat.displayName = "CloseChat"

const ChatContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex-grow overflow-y-auto p-4", className)} {...props} />
  ),
)
ChatContent.displayName = "ChatContent"

const Messege = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex mb-4", className)} {...props} />,
)
Messege.displayName = "Messege"

const MessegeAuthorProfileImage = React.forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(
  ({ className, ...props }, ref) => <img ref={ref} className={cn("w-8 h-8 rounded-full mr-2", className)} {...props} />,
)
MessegeAuthorProfileImage.displayName = "MessegeAuthorProfileImage"

const MessegeContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("bg-accent rounded-lg p-3 max-w-[70%]", className)} {...props} />
  ),
)
MessegeContent.displayName = "MessegeContent"

const ChatInput = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-3 border-t", className)} {...props} />
  ),
)
ChatInput.displayName = "ChatInput"

const MessegeInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <Input ref={ref} className={cn("flex-grow p-2 rounded-lg border", className)} {...props} />
  ),
)
MessegeInput.displayName = "MessegeInput"

const SendMessegeButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <Button
      ref={ref}
      className={cn("ml-2 p-2 rounded-full bg-primary text-primary-foreground", className)}
      {...props}
    />
  ),
)
SendMessegeButton.displayName = "SendMessegeButton"

export {
  Chat,
  ChatList,
  ChatListItem,
  ChatListItemProfileImage,
  ChatListItemHeader,
  ChatListItemLastMessegePreview,
  ChatListItemTimeStamp,
  ChatListItemUnreadCount,
  ChatWrapper,
  ChatHeader,
  ChatHeaderProfileImage,
  ChatHeaderName,
  ChatHeaderLastSeen,
  CloseChat,
  ChatContent,
  Messege,
  MessegeAuthorProfileImage,
  MessegeContent,
  ChatInput,
  MessegeInput,
  SendMessegeButton,
}

export type { ChatData, ChatMessege }

