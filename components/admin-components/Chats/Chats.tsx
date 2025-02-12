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
  Messege,
  MessegeAuthorProfileImage,
  MessegeContent,
  MessegeInput,
  SendMessegeButton,
} from "@/components/ui/chat"
import type { TeamPopulatedChatsType } from "@/lib/types"
import { LockOpen, Send } from "lucide-react"
import moment from "moment"
import { createMessege, handleMessegesRead } from "@/lib/actions/messeges.actions"
import MessegeItem from "./Messege"
import Link from "next/link"

export default function Chats({ stringifiedTeamData, clerkId }: { stringifiedTeamData: string; clerkId: string }) {
  const [teamData, setTeamData] = useState<TeamPopulatedChatsType>(JSON.parse(stringifiedTeamData))
  const [selectedChat, setSelectedChat] = useState<TeamPopulatedChatsType["chats"][number] | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const markMessegesAsRead = async () => {
      if (selectedChat) {
        const unreadMessegeIds = selectedChat.messeges
          .filter((messege) => !messege.readBy.find((user) => user.clerkId === clerkId))
          .map((messege) => messege._id);
  
        if (unreadMessegeIds.length > 0) {
          console.log("Marking messeges as read:", unreadMessegeIds);
  
          try {
            await handleMessegesRead({ messegesIds: unreadMessegeIds, clerkId });
  
            const updatedChats = teamData.chats.map((chat) => {
              if (chat._id === selectedChat._id) {
                const updatedMesseges = chat.messeges.map((messege) => {
                  if (unreadMessegeIds.includes(messege._id)) {
                    return {
                      ...messege,
                      readBy: [...messege.readBy, { _id: "id", clerkId }], // Update the local state with the read messege
                    };
                  }
                  return messege;
                });
                return { ...chat, messeges: updatedMesseges };
              }
              return chat;
            });
  
            setTeamData({ ...teamData, chats: updatedChats });
          } catch (error) {
            console.error("Failed to mark messeges as read:", error);
          }
        }
      }
    };
  
    markMessegesAsRead();
  }, [selectedChat, clerkId]);
  

  const handleChatSelect = (chat: TeamPopulatedChatsType["chats"][number]) => {
    setSelectedChat(chat)
  }

  const [messageContent, setMessageContent] = useState<string>("");

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !selectedChat) return;

    try {
      const result = await createMessege({
        sender: selectedChat.people[1]._id,
        content: messageContent,
        messegeType: "text",
        chat: selectedChat._id,
      }, 'json');

      const newMessege = JSON.parse(result)

      const updatedMesseges = [...selectedChat.messeges, newMessege];
      setSelectedChat({ ...selectedChat, messeges: updatedMesseges });

      setMessageContent("");

      containerRef.current?.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <Chat className="h-screen w-full flex bg-gray-100" ref={containerRef}>
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
            <ChatHeaderName className="ml-4 font-semibold text-gray-900">{selectedChat.name}</ChatHeaderName>
          </ChatHeader>
          <ChatContent className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {selectedChat.messeges.reduce((acc: JSX.Element[], messege, index, array) => {
              const isFirstUnread =
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
              onChange={(e) => setMessageContent(e.target.value)}
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

