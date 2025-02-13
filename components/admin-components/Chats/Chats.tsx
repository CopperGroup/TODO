"use client"

import { useState, useEffect, useRef } from "react"
import {
  Chat,
  ChatContent,
  ChatHeader,
  ChatHeaderName,
  ChatHeaderProfileImage,
  ChatInput,
  ChatList,
  ChatListItem,
  ChatListItemHeader,
  ChatListItemLastMessegePreview,
  ChatListItemProfileImage,
  ChatListItemTimeStamp,
  ChatListItemUnreadCount,
  ChatWrapper,
  MessegeInput,
  SendMessegeButton,
} from "@/components/ui/chat"
import type { TeamPopulatedChatsType } from "@/lib/types"
import { LockOpen, Send } from "lucide-react"
import moment from "moment"
import { createMessege, handleMessegesRead } from "@/lib/actions/messeges.actions"
import MessegeItem from "./Messege"
import Link from "next/link"
import { Realtime } from "ably"

export default function Chats({ stringifiedTeamData, clerkId }: { stringifiedTeamData: string; clerkId: string }) {
  const [teamData, setTeamData] = useState<TeamPopulatedChatsType>(JSON.parse(stringifiedTeamData))
  const [selectedChat, setSelectedChat] = useState<TeamPopulatedChatsType["chats"][number] | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const ablyRef = useRef<Realtime | null>(null)
  const [messageContent, setMessageContent] = useState<string>("")
  const [firstLoad, setFirstLoad] = useState(true);

  
  useEffect(() => {
    const ably = new Realtime({ key: process.env.NEXT_PUBLIC_ABLY_API_KEY })
    ablyRef.current = ably
    
    return () => {
      ably.close()
    }
  }, [])
  
  useEffect(() => {
    if (firstLoad) {
      setFirstLoad(false); 
    }
  }, []);

  useEffect(() => {
    if (!selectedChat || !ablyRef.current) return;
  
    const channel = ablyRef.current.channels.get(`chat:${selectedChat._id}`);
  
    channel.subscribe("new-message", (message) => {
      const newMessege = message.data;
  
      setSelectedChat((prevChat) => {
        if (!prevChat) return null;
        return { ...prevChat, messeges: [...prevChat.messeges, newMessege] };
      });
  
      markMessagesAsRead(selectedChat);
    });
  
    markMessagesAsRead(selectedChat);
  
    return () => {
      channel.unsubscribe("new-message");
    };
  }, [selectedChat]);
  
  useEffect(() => {
    if (!containerRef.current) return;
  
    const observer = new MutationObserver(() => {
      containerRef.current?.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  
    observer.observe(containerRef.current, { childList: true, subtree: true });
  
    return () => observer.disconnect();
  }, [selectedChat]);
  

  const markMessagesAsRead = async (chat: TeamPopulatedChatsType["chats"][number]) => {
    const unreadMessages = chat.messeges.filter((msg) => !msg.readBy.find((user) => user.clerkId === clerkId));
  
    if (unreadMessages.length > 0) {
      try {
        // Send request to mark messages as read
        await handleMessegesRead({ messegesIds: unreadMessages.map((msg) => msg._id), clerkId });
  
        // Update the state to reflect the messages are read
        setSelectedChat((prevChat) => {
          if (!prevChat) return null;
          const updatedMessages = prevChat.messeges.map((msg) => {
            if (unreadMessages.find((unread) => unread._id === msg._id)) {
              return {
                ...msg,
                readBy: [...msg.readBy, { _id: "_id", clerkId }],
              };
            }
            return msg;
          });
          return { ...prevChat, messeges: updatedMessages };
        });
      } catch (error) {
        console.error("Failed to mark messages as read:", error);
      }
    }
  };
  

  
  const handleChatSelect = (chat: TeamPopulatedChatsType["chats"][number]) => {
    setSelectedChat(chat)
  }

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !selectedChat) return

    try {
      const content = messageContent
      setMessageContent("")

      const result = await createMessege({
        sender: selectedChat.people.find(p => p.clerkId === clerkId)!._id,
        content,
        messegeType: "text",
        chat: selectedChat._id,
      }, 'json')

      const newMessege = JSON.parse(result)

      // Publish message to Ably channel
      const channel = ablyRef.current?.channels.get(`chat:${selectedChat._id}`)
      channel?.publish("new-message", newMessege)
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  return (
    <Chat className="h-screen w-full flex bg-gray-100">
      <ChatList className="w-1/4 border-r border-gray-200 bg-white overflow-y-auto custom-scrollbar-white">
        {teamData.chats.map((chat) => {
          const lastMessege = chat.messeges[chat.messeges.length - 1]
          const unreadCount = chat.messeges.filter((msg) => !msg.readBy.find((user) => user.clerkId === clerkId)).length
          const chatUserInfo = chat.people.filter((p) => p.clerkId != clerkId)[0]
          return (
            <ChatListItem
              key={chat._id}
              onClick={() => handleChatSelect(chat)}
              className={`p-4 hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${
                selectedChat?._id === chat._id ? "bg-gray-100" : ""
              }`}
            >
              <div className="w-full flex items-center space-x-3">
                <ChatListItemProfileImage
                  src={chatUserInfo.profilePicture || "/default-avatar.png"}
                  alt={chat.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <ChatListItemHeader className="font-semibold text-gray-900 truncate">
                      {chatUserInfo.name}
                    </ChatListItemHeader>
                    <ChatListItemTimeStamp className="text-xs text-gray-500 whitespace-nowrap">
                      {lastMessege ? moment(lastMessege.createdAt).fromNow() : "No messeges"}
                    </ChatListItemTimeStamp>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <ChatListItemLastMessegePreview className="text-sm text-gray-600 truncate">
                      {lastMessege ? `${lastMessege.type.startsWith("Request") ? "Request..." : lastMessege.content}` : "No messeges yet"}
                    </ChatListItemLastMessegePreview>
                    {unreadCount > 0 && (
                      <ChatListItemUnreadCount className="ml-2 coppergroup-gradient text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount}
                      </ChatListItemUnreadCount>
                    )}
                  </div>
                </div>
              </div>
            </ChatListItem>
          )
        })}
      </ChatList>
      {selectedChat ? (
        <ChatWrapper className="w-3/4 flex flex-col bg-white">
          <ChatHeader className="bg-white border-b border-gray-200 p-4 flex items-center">
            <ChatHeaderProfileImage
              src={selectedChat.people.filter(p => p.clerkId !== clerkId)[0]?.profilePicture || "/default-avatar.png"}
              alt={selectedChat.name}
              className="w-10 h-10 rounded-full"
            />
            <ChatHeaderName className="ml-4 font-semibold text-gray-900">{selectedChat.people.filter((p) => p.clerkId != clerkId)[0].name}</ChatHeaderName>
          </ChatHeader>
          <ChatContent className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar" ref={containerRef}>
            {selectedChat.messeges.reduce((acc: JSX.Element[], messege, index, array) => {
              const isFirstUnread =
                firstLoad &&  // Only show "New" during the initial load
                !messege.readBy.find((user) => user.clerkId === clerkId) &&
                (index === 0 || array[index - 1].readBy.find((user) => user.clerkId === clerkId));

              if (isFirstUnread) {
                acc.push(
                  <div key={`new-${messege._id}`} className="flex items-center my-4">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="mx-4 px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full">New</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                  </div>
                );
              }

              acc.push(<MessegeItem key={messege._id} messege={messege} clerkId={clerkId} teamId={teamData._id} />);
              
              return acc;
            }, [])}
          </ChatContent>
          <ChatInput className="bg-white border-t border-gray-200 p-4 flex items-center">
            <MessegeInput
              placeholder="Type a messege..."
              className="flex-1 bg-gray-100 border-none rounded-md px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={selectedChat.people.filter(p => p.clerkId !== clerkId)[0].email === "system@kolos.com"}
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <SendMessegeButton
              onClick={handleSendMessage}
              className="ml-4 bg-zinc-800 text-white p-3 rounded-md transition-colors duration-200"
              disabled={!messageContent.trim() || selectedChat.people.filter(p => p.clerkId !== clerkId)[0].email === "system@kolos.com"}
            >
              <Send size={20} />
            </SendMessegeButton>
          </ChatInput>
        </ChatWrapper>
      ) : (
        <div className="w-3/4 flex items-center justify-center text-gray-500 bg-white">
          {teamData.plan === 'basic_plan' ? (
            <Link href={`/dashboard/plan/${teamData._id}`} className="text-xl text-center font-semibold">Upgrade to<span className="coppergroup-gradient-text font-bold ml-2">Pro</span><br/>to <span className="coppergroup-gradient-text font-bold ml-2">Unlock</span> team messeges</Link>
            ): (
              <p className="text-xl font-semibold">Select a chat to start messaging</p>
            )
          }
        </div>
      )}
    </Chat>
  )
}

