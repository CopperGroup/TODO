"use client";

import React from "react";
import {
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
} from "@/components/ui/chat";

const mockChats = [
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
];

const ChatApp = () => {
  const [activeChat, setActiveChat] = React.useState<string | null>(null);

  const handleChatSelect = (id: string) => {
    setActiveChat(id);
  };

  const handleCloseChat = () => {
    setActiveChat(null);
  };

  return (
    <div className="flex h-screen">
      <div className="flex-none w-full sm:w-80 border-r">
        <ChatList chats={mockChats} onChatSelect={handleChatSelect} activeChat={activeChat || undefined} />
      </div>
      {activeChat && (
        <ChatWindow isOpen={!!activeChat} onClose={handleCloseChat} className="w-full">
          <ChatHeader name={mockChats.find((chat) => chat.id === activeChat)?.name || ""} 
                      avatar={mockChats.find((chat) => chat.id === activeChat)?.avatar} 
                      onClose={handleCloseChat} />
          <div className="flex-grow overflow-y-auto p-4">
            <Message sender="Alice" timestamp="2 minutes ago" avatar="/placeholder.svg?height=40&width=40">
              <MessageContent>Hey, how's it going?</MessageContent>
            </Message>
            <Message sender="You" timestamp="1 minute ago" isCurrentUser>
              <MessageContent>I'm doing well, thanks for asking!</MessageContent>
            </Message>
            <Message sender="Alice" timestamp="Just now" avatar="/placeholder.svg?height=40&width=40">
              <MessageContent>Great! Do you have time for a quick call later today?</MessageContent>
            </Message>
          </div>
          <ChatInput />
        </ChatWindow>
      )}
    </div>
  );
};

export default ChatApp;
