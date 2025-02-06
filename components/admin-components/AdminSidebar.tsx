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

// const teams = [
//   { id: 1, name: "Engineering", image: "/placeholder.svg?height=32&width=32" },
//   { id: 2, name: "Design", image: "/placeholder.svg?height=32&width=32" },
//   { id: 3, name: "Marketing", image: "/placeholder.svg?height=32&width=32" },
// ]

const navItems = [
  { title: "Summary", icon: PieChart, url: "/dashboard" },
  { title: "Tasks", icon: ListTodo, url: "/dashboard/tasks" },
  { title: "Boards", icon: LayoutDashboard, url: "/dashboard/boards" },
  { title: "Members", icon: Users, url: "/dashboard/members" },
]

// const existingBoards = [
//   { id: 1, name: "Project Alpha", url: "/dashboard/boards/1" },
//   { id: 2, name: "Marketing Campaign", url: "/dashboard/boards/2" },
//   { id: 3, name: "Bug Tracker", url: "/dashboard/boards/3" },
// ]

export function AdminSidebar({ teams }: { teams: { teamId: string, name: string, teamColor: string, boards: { boardId: string; name: string }[] }[]}) {
  const router = useRouter();
  const pathname = usePathname();
  const parts = pathname.split('/'); 
  const id = parts[3];

  if(!id) {
    router.push("/dashboard")
  }

  const [selectedTeam, setSelectedTeam] = React.useState(teams.find(team => team.teamId.toString() === id?.toString()))

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
                    {/* <Image
                      src={selectedTeam.image || "/placeholder.svg"}
                      alt={selectedTeam.name}
                      width={32}
                      height={32}
                      className="rounded-md"
                    /> */}
                      <div className="w-8 h-8 text-lg font-semibold text-center rounded-md pt-[1px]" style={{ background: selectedTeam?.teamColor}}><span style={{ color: getTextColorBasedOnBackground(selectedTeam?.teamColor || "#ffffff")}}>{selectedTeam?.name.slice(0, 1)}</span></div>
                    <span className="font-semibold">{selectedTeam?.name}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto h-4 w-4 text-gray-500" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-[200px] w-[--radix-dropdown-menu-trigger-width] overflow-y-auto custom-scrollbar-white" align="start">
                {teams.map((team) => (
                  <Link href={`/dashboard/team/${team.teamId}`} key={team.teamId}>
                    <DropdownMenuItem
                      onSelect={() => setSelectedTeam(team)}
                      className="flex items-center gap-3 py-2"
                    >
                      <div className="w-8 h-8 text-lg font-semibold text-center rounded-md pt-[1px]" style={{ background: team.teamColor}}><span style={{ color: getTextColorBasedOnBackground(team.teamColor)}}>{team.name.slice(0, 1)}</span></div>
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
                            <Link href={`/dashboard/team/${selectedTeam?.teamId}/board/${board.boardId}`} className="flex items-center gap-2">
                              <div className="w-6 h-6 flex flex-shrink-0 justify-center items-center coppergroup-gradient rounded-md">
                                <LayoutDashboard className="h-4 w-4 text-gray-100" />
                              </div>
                              {board.name}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/boards/new" className="flex items-center gap-2 text-blue-600">
                            <PlusCircle className="h-4 w-4" />
                            Create New Board
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <SidebarMenuButton asChild className="hover:bg-gray-100 transition-colors duration-200">
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">{item.title}</span>
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
              <Button variant="ghost" className="w-full justify-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">John Doe</span>
                  <span className="text-xs text-gray-500">john@example.com</span>
                </div>
                <Settings className="ml-auto h-4 w-4 text-gray-500" />
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

