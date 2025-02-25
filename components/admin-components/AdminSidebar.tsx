"use client"

import * as React from "react"
import {
  Check,
  ChevronsUpDown,
  LayoutDashboard,
  ListTodo,
  Users,
  PieChart,
  Settings,
  ChevronRight,
  PlusCircle,
  Inbox,
  Pen,
  Video,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useUser } from "@clerk/nextjs"
import { usePathname, useRouter } from "next/navigation"
import { getTextColorBasedOnBackground } from "@/lib/utils"
import { UserType } from "@/lib/models/user.model"
import plans from "@/constants/plans"


export function AdminSidebar({ user, teams }: { user: UserType, teams: { teamId: string, name: string, teamColor: string, boards: { boardId: string; name: string }[], members: { user: string, role: "Admin" | "Member" }[], userUnreadMesseges: number, plan: 'basic_plan' | 'pro_plan' }[]}) {
  const router = useRouter();
  const pathname = usePathname();
  const parts = pathname.split('/'); 
  const id = parts[3];

  if(!id) {
    router.push("/dashboard")
  }
  
  const [selectedTeam, setSelectedTeam] = React.useState(teams.find(team => team.teamId.toString() === id?.toString()))
  
  const navItems = [
    { title: "Summary", icon: PieChart, url: `/dashboard/team/${selectedTeam?.teamId}` },
    { title: "Tasks", icon: ListTodo, url: `/dashboard/team/${selectedTeam?.teamId}/tasks` },
    { title: "Boards", icon: LayoutDashboard, url: "/dashboard/boards" },
    { title: "Members", icon: Users, url: `/dashboard/team/${selectedTeam?.teamId}/members` },
    { title: "Messages", icon: Inbox, url: `/dashboard/team/${selectedTeam?.teamId}/messeges`},
    { title: "Canvas", icon: Pen, url: `/dashboard/team/${selectedTeam?.teamId}/canvas`},
    { title: "Meetings", icon: Video, url: `/dashboard/team/${selectedTeam?.teamId}/meetings`}
  ]

  React.useEffect(() => {
    if(selectedTeam) {
      if(!selectedTeam.members.map(member => member.user).includes(user._id)) {
        router.push('/dashboard')
      }
    }
  }, [selectedTeam])

  const setUnreadMessagesToZero = () => {
    setSelectedTeam((prev) => {
      if (!prev) return prev; // Ensure prev exists
      return {
        ...prev,
        userUnreadMesseges: 0,
      };
    });
  };
  
  
  return (
    <Sidebar className="border-r border-gray-200 bg-white">
      <SidebarHeader className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="w-full justify-between bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                      <div className="w-8 h-8 text-lg font-semibold text-center rounded-md pt-[1px]" style={{ background: selectedTeam?.teamColor}}><span style={{ color: getTextColorBasedOnBackground(selectedTeam?.teamColor || "#ffffff")}}>{selectedTeam?.name.slice(0, 1)}</span></div>
                    <span className="font-semibold">{selectedTeam?.name}</span>
                    {selectedTeam?.plan === "basic_plan" ? (
                      <span className="text-xs text-gray-700 font-medium mb-2 -ml-2">Basic</span>
                    ): (
                      <span className="text-xs coppergroup-gradient-text font-bold mb-2 -ml-2">Pro</span>
                    )}
                  </div>
                  <ChevronsUpDown className="ml-auto h-4 w-4 text-gray-500" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-[200px] w-[--radix-dropdown-menu-trigger-width] overflow-y-auto custom-scrollbar-white" align="start">
                {teams.map((team) => (
                  <Link href={`/dashboard/team/${team.teamId}`} key={team.teamId}>
                    <DropdownMenuItem
                      key={team.teamId}
                      onSelect={() => setSelectedTeam(team)}
                      className="flex items-center gap-3 py-2"
                    >
                      <div className={`w-8 h-8 text-lg font-semibold text-center rounded-md pt-[1px] ${team.plan === "pro_plan" ? "coppergroup-gradient" : ""}`} style={ team.plan === "basic_plan" ? { background: team.teamColor } : {}}><span style={{ color: getTextColorBasedOnBackground(team.teamColor)}}>{team.name.slice(0, 1)}</span></div>
                      {team.name}
                      {team.teamId === selectedTeam?.teamId && <Check className="ml-auto h-4 w-4 text-green-500" />}
                    </DropdownMenuItem>
                  </Link>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.title === "Boards" ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuButton className="w-full justify-between hover:bg-gray-100 transition-colors duration-200">
                          <div className="flex items-center gap-3">
                            <item.icon className="h-5 w-5 text-gray-600" />
                            <span className="font-medium">{item.title}</span>
                          </div>
                          <ChevronRight className="ml-auto h-4 w-4 text-gray-500" />
                        </SidebarMenuButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="start" side="right">
                        {selectedTeam?.boards.map((board) => (
                          <DropdownMenuItem key={board.boardId} asChild>
                            <Link href={`/dashboard/team/${selectedTeam?.teamId}/board/${board.boardId}`} className="flex items-center gap-2 cursor-pointer">
                              <div className="w-6 h-6 flex flex-shrink-0 justify-center items-center coppergroup-gradient rounded-md">
                                <LayoutDashboard className="h-4 w-4 text-gray-100" />
                              </div>
                              {board.name}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                        {((selectedTeam?.boards.length || 1)) < plans['pro_plan'].features.boards && (
                          <DropdownMenuItem asChild>
                            {(selectedTeam ? selectedTeam.boards.length : 1) < (plans[selectedTeam ? selectedTeam.plan : 'basic_plan'].features.boards) ? (
                                <Link href={`/dashboard/team/${selectedTeam?.teamId}/board/new`} className="flex items-center gap-2 text-blue-600 cursor-pointer">
                                  <PlusCircle className="h-4 w-4" />
                                  Create New Board 
                                </Link>
                              ): (
                                <Link href={`/dashboard/plan/${selectedTeam?.teamId}`} className="flex items-center gap-2 text-blue-600/40 cursor-pointer hover:text-blue-500 focus:text-blue-500">
                                  <PlusCircle className="h-4 w-4" />
                                  Create New Board <span className="coppergroup-gradient-text font-bold">Pro</span>
                                </Link>
                              )

                            }
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <SidebarMenuButton asChild className="hover:bg-gray-100 transition-colors duration-200">
                      <Link 
                       href={item.url} 
                       className="flex items-center justify-between w-full"
                       onClick={() => {
                        if (item.title === "Messeges" && selectedTeam && selectedTeam?.userUnreadMesseges > 0) {
                          setUnreadMessagesToZero();
                        }
                      }} 
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="h-5 w-5 text-gray-600" />
                          <span className="font-medium">{item.title}</span>
                        </div>
                        {item.title === "Messeges" && selectedTeam && selectedTeam.userUnreadMesseges > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {selectedTeam.userUnreadMesseges}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="w-full justify-between hover:bg-gray-100 transition-colors duration-200"
            >
            <Button variant="ghost" className="w-full justify-start gap-3 h-auto py-2">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={user.profilePicture || ""} alt="User" />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start min-w-0 flex-1">
                <span className="text-sm font-medium truncate w-full">{user.name}</span>
                <span className="text-xs text-gray-500 truncate w-full">{user.email}</span>
              </div>
              {/* <Settings className="h-4 w-4 text-gray-500 flex-shrink-0" /> */}
            </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

