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

const teams = [
  { id: 1, name: "Engineering", image: "/placeholder.svg?height=32&width=32" },
  { id: 2, name: "Design", image: "/placeholder.svg?height=32&width=32" },
  { id: 3, name: "Marketing", image: "/placeholder.svg?height=32&width=32" },
]

const navItems = [
  { title: "Summary", icon: PieChart, url: "/dashboard" },
  { title: "Tasks", icon: ListTodo, url: "/dashboard/tasks" },
  { title: "Boards", icon: LayoutDashboard, url: "/dashboard/boards" },
  { title: "Members", icon: Users, url: "/dashboard/members" },
]

const existingBoards = [
  { id: 1, name: "Project Alpha", url: "/dashboard/boards/1" },
  { id: 2, name: "Marketing Campaign", url: "/dashboard/boards/2" },
  { id: 3, name: "Bug Tracker", url: "/dashboard/boards/3" },
]

export function AdminSidebar() {
  const [selectedTeam, setSelectedTeam] = React.useState(teams[0])

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
                    <Image
                      src={selectedTeam.image || "/placeholder.svg"}
                      alt={selectedTeam.name}
                      width={32}
                      height={32}
                      className="rounded-md"
                    />
                    <span className="font-semibold">{selectedTeam.name}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto h-4 w-4 text-gray-500" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]" align="start">
                {teams.map((team) => (
                  <DropdownMenuItem
                    key={team.id}
                    onSelect={() => setSelectedTeam(team)}
                    className="flex items-center gap-3 py-2"
                  >
                    <Image
                      src={team.image || "/placeholder.svg"}
                      alt={team.name}
                      width={24}
                      height={24}
                      className="rounded-md"
                    />
                    {team.name}
                    {team.id === selectedTeam.id && <Check className="ml-auto h-4 w-4 text-green-500" />}
                  </DropdownMenuItem>
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
                        {existingBoards.map((board) => (
                          <DropdownMenuItem key={board.id} asChild>
                            <Link href={board.url} className="flex items-center gap-2">
                              <LayoutDashboard className="h-4 w-4 text-gray-500" />
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

