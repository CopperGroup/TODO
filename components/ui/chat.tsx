"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Send } from "lucide-react"

// Types
interface ChatItemProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string
  name: string
  lastMessage: string
  timestamp: string
  unreadCount?: number
  avatar?: string
  isActive?: boolean
}

interface ChatListProps extends React.HTMLAttributes<HTMLDivElement> {
  chats: ChatItemProps[]
  onChatSelect: (id: string) => void
  activeChat?: string
}

interface ChatWindowProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
}

interface ChatHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string
  avatar?: string
  onClose: () => void
}

interface MessageInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSend: (message: string) => void
}

interface SendButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onSend: () => void
}

interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  sender: string
  timestamp: string
  avatar?: string
  isCurrentUser?: boolean
}

// ChatAvatar Component
const ChatAvatar = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Avatar> & { src?: string; alt: string }
>(({ src, alt, className, ...props }, ref) => (
  <Avatar ref={ref} className={cn("h-10 w-10", className)} {...props}>
    <AvatarImage src={src} alt={alt} />
    <AvatarFallback>{alt.slice(0, 2).toUpperCase()}</AvatarFallback>
  </Avatar>
))
ChatAvatar.displayName = "ChatAvatar"

// ChatItemHeader Component
const ChatItemHeader = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => <h3 ref={ref} className={cn("font-semibold truncate", className)} {...props} />,
)
ChatItemHeader.displayName = "ChatItemHeader"

// LastMessagePreview Component
const LastMessagePreview = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground truncate", className)} {...props} />
  ),
)
LastMessagePreview.displayName = "LastMessagePreview"

// Time Component
const Time = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={cn("text-xs text-muted-foreground shrink-0", className)} {...props} />
  ),
)
Time.displayName = "Time"

// UnreadMessagesCount Component
const UnreadMessagesCount = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof Badge>>(
  ({ className, ...props }, ref) => <Badge className={cn("ml-auto", className)} {...props} />,
)
UnreadMessagesCount.displayName = "UnreadMessagesCount"

// ChatItem Component
const ChatItem = React.forwardRef<HTMLDivElement, ChatItemProps>(
  ({ name, lastMessage, timestamp, unreadCount, avatar, isActive, onClick, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center space-x-4 p-3 cursor-pointer transition-colors",
        isActive ? "bg-accent" : "hover:bg-muted",
        className,
      )}
      onClick={onClick}
      {...props}
    >
      <ChatAvatar src={avatar} alt={name} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <ChatItemHeader>{name}</ChatItemHeader>
          <Time>{timestamp}</Time>
        </div>
        <LastMessagePreview>{lastMessage}</LastMessagePreview>
      </div>
      {unreadCount && unreadCount > 0 && <UnreadMessagesCount>{unreadCount}</UnreadMessagesCount>}
    </div>
  ),
)
ChatItem.displayName = "ChatItem"

// ChatList Component
const ChatList = React.forwardRef<HTMLDivElement, ChatListProps>(
  ({ chats, onChatSelect, activeChat, className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-2", className)} {...props}>
      {chats.map((chat) => (
        <ChatItem key={chat.id} {...chat} isActive={chat.id === activeChat} onClick={() => onChatSelect(chat.id)} />
      ))}
    </div>
  ),
)
ChatList.displayName = "ChatList"

// ChatHeader Component
const ChatHeader = React.forwardRef<HTMLDivElement, ChatHeaderProps>(
  ({ name, avatar, onClose, className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center justify-between p-4 border-b", className)} {...props}>
      <div className="flex items-center space-x-3">
        <ChatAvatar src={avatar} alt={name} />
        <h2 className="font-semibold">{name}</h2>
      </div>
      <Button variant="ghost" size="icon" onClick={onClose}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  ),
)
ChatHeader.displayName = "ChatHeader"

// ChatWindow Component
const ChatWindow = React.forwardRef<HTMLDivElement, ChatWindowProps>(
  ({ isOpen, onClose, children, className, ...props }, ref) => (
    <>
      {isOpen && (
        <div ref={ref} className={cn("flex flex-col h-full bg-background", className)} {...props}>
          {children}
        </div>
      )}
    </>
  ),
)
ChatWindow.displayName = "ChatWindow"

// MessageInput Component
const MessageInput = React.forwardRef<HTMLInputElement, MessageInputProps>(({ onSend, className, ...props }, ref) => {
  const [message, setMessage] = React.useState("")

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (message.trim()) {
        onSend(message)
        setMessage("")
      }
    }
  }

  return (
    <Input
      ref={ref}
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Type a message..."
      className={cn("flex-1", className)}
      {...props}
    />
  )
})
MessageInput.displayName = "MessageInput"

// SendButton Component
const SendButton = React.forwardRef<HTMLButtonElement, SendButtonProps>(({ onSend, className, ...props }, ref) => (
  <Button ref={ref} type="button" size="icon" onClick={onSend} className={cn(className)} {...props}>
    <Send className="h-4 w-4" />
  </Button>
))
SendButton.displayName = "SendButton"

// ChatInput Component
const ChatInput = React.forwardRef<HTMLFormElement, React.HTMLAttributes<HTMLFormElement>>(
  ({ className, ...props }, ref) => {
    const handleSend = (message: string) => {
      console.log(`Sending message: ${message}`)
      // Implement your send message logic here
    }

    return (
      <form ref={ref} className={cn("flex items-center p-4 border-t", className)} {...props}>
        <MessageInput onSend={handleSend} className="mr-2" />
        <SendButton onSend={() => handleSend("")} />
      </form>
    )
  },
)
ChatInput.displayName = "ChatInput"

// Sender Component
const Sender = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement> & { isCurrentUser: boolean }>(
  ({ isCurrentUser, className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn("font-semibold", isCurrentUser ? "text-primary" : "text-foreground", className)}
      {...props}
    />
  ),
)
Sender.displayName = "Sender"

// MessageContent Component
const MessageContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("mt-1", className)} {...props} />,
)
MessageContent.displayName = "MessageContent"

// Message Component
const Message = React.forwardRef<HTMLDivElement, MessageProps>(
  ({ sender, timestamp, avatar, isCurrentUser = false, children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-start space-x-3 mb-4",
        isCurrentUser ? "flex-row-reverse space-x-reverse" : "flex-row",
        className,
      )}
      {...props}
    >
      {!isCurrentUser && <ChatAvatar src={avatar} alt={sender} />}
      <div className={cn("flex flex-col", isCurrentUser ? "items-end" : "items-start")}>
        <div className={cn("px-3 py-2 rounded-lg", isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted")}>
          <Sender isCurrentUser={isCurrentUser}>{isCurrentUser ? "You" : sender}</Sender>
          <MessageContent>{children}</MessageContent>
        </div>
        <Time>{timestamp}</Time>
      </div>
    </div>
  ),
)
Message.displayName = "Message"

// Main Chat Component
const Chat = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => {
  const [activeChat, setActiveChat] = React.useState<string | null>(null)

  const handleChatSelect = (id: string) => {
    setActiveChat(id)
  }

  const handleCloseChat = () => {
    setActiveChat(null)
  }

  const handleSendMessage = (message: string) => {
    console.log(`Sending message: ${message}`)
    // Implement your send message logic here
  }

  const mockChats: ChatItemProps[] = [
    {
      id: "1",
      name: "Alice Johnson",
      lastMessage: "Hey, how's it going?",
      timestamp: "5m ago",
      unreadCount: 2,
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "2",
      name: "Bob Smith",
      lastMessage: "Can we reschedule our meeting?",
      timestamp: "2h ago",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "3",
      name: "Carol Williams",
      lastMessage: "I've sent you the report.",
      timestamp: "1d ago",
      unreadCount: 1,
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const activeChatData = mockChats.find((chat) => chat.id === activeChat)

  return (
    <div ref={ref} className={cn("flex h-screen", className)} {...props}>
      <div className={cn("flex-none w-full sm:w-80 border-r", activeChat ? "hidden sm:block" : "block")}>
        <div className="h-full overflow-y-auto">
          <ChatList chats={mockChats} onChatSelect={handleChatSelect} activeChat={activeChat || undefined} />
        </div>
      </div>
      {activeChat && (
        <div className="flex-grow flex flex-col h-full">
          <ChatHeader name={activeChatData?.name || ""} avatar={activeChatData?.avatar} onClose={handleCloseChat} />
          <div className="flex-grow overflow-y-auto p-4">
            <Message sender="Alice" timestamp="2 minutes ago" avatar="/placeholder.svg?height=40&width=40">
              Hey, how's it going?
            </Message>
            <Message sender="You" timestamp="1 minute ago" isCurrentUser>
              I'm doing well, thanks for asking!
            </Message>
            <Message sender="Alice" timestamp="Just now" avatar="/placeholder.svg?height=40&width=40">
              Great! Do you have time for a quick call later today?
            </Message>
          </div>
          <ChatInput />
        </div>
      )}
    </div>
  )
})
Chat.displayName = "Chat"

export {
  ChatItem,
  ChatList,
  ChatWindow,
  ChatHeader,
  ChatInput,
  Message,
  ChatAvatar,
  ChatItemHeader,
  LastMessagePreview,
  Time,
  UnreadMessagesCount,
  Sender,
  MessageContent,
  MessageInput,
  SendButton,
}



