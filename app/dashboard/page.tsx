// 'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PlusCircle, MessageCircle, Users, Calendar, BarChart2 } from "lucide-react"
import CreateTeamForm from "@/components/forms/CreateTeam"
import { fetchUsersTeams } from "@/lib/actions/team.actions"
import { cn, getTextColorBasedOnBackground } from "@/lib/utils"
import Link from "next/link"
import { currentUser } from '@clerk/nextjs/server'

// Mock data (replace with actual data fetching in a real application)
const mockTeams = [
  {
    id: "1",
    name: "Product Development",
    totalTasks: 87,
    completedTasks: 52,
    unreadMessages: 14,
    members: [
      { id: "1", name: "Alice", image: "/placeholder-user.jpg", online: true },
      { id: "2", name: "Bob", image: "/placeholder-user.jpg", online: false },
      { id: "3", name: "Charlie", image: "/placeholder-user.jpg", online: true },
    ],
    boards: [
      { id: "1", name: "Sprint Planning" },
      { id: "2", name: "Bug Tracking" },
    ],
    nextMeeting: "2023-06-15T10:00:00Z",
    recentActivity: 'Alice completed task "Implement user authentication"',
  },
  {
    id: "2",
    name: "Marketing",
    totalTasks: 54,
    completedTasks: 38,
    unreadMessages: 7,
    members: [
      { id: "4", name: "David", image: "/placeholder-user.jpg", online: true },
      { id: "5", name: "Eva", image: "/placeholder-user.jpg", online: true },
    ],
    boards: [
      { id: "3", name: "Campaign Planning" },
      { id: "4", name: "Content Calendar" },
    ],
    nextMeeting: "2023-06-16T14:30:00Z",
    recentActivity: "Eva updated the Q3 marketing strategy document",
  },
]

export default async function TeamsPage() {
  
  const user = await currentUser();

  const myTeams = await fetchUsersTeams({ clerkId: user?.id });

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold">My Teams</h1>
        <CreateTeamForm />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* {mockTeams.map((team) => (
          <Card key={team.id} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-copper-100 to-copper-200 p-4">
              <CardTitle className="text-2xl text-copper-800">{team.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Tasks Progress</p>
                  <Progress value={(team.completedTasks / team.totalTasks) * 100} className="w-32" />
                </div>
                <Badge variant="secondary" className="flex items-center">
                  <MessageCircle className="mr-1 h-4 w-4" />
                  {team.unreadMessages} unread
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="flex items-center mb-2">
                    <Users className="mr-2 h-5 w-5 text-copper-600" />
                    <p className="text-sm font-semibold">Team Members</p>
                  </div>
                  <div className="flex -space-x-2">
                    {team.members.map((member) => (
                      <Avatar key={member.id} className="border-2 border-white">
                        <AvatarImage src={member.image} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center mb-2">
                    <BarChart2 className="mr-2 h-5 w-5 text-copper-600" />
                    <p className="text-sm font-semibold">Active Boards</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {team.boards.map((board) => (
                      <Badge key={board.id} variant="outline">
                        {board.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-copper-600" />
                  <p className="text-sm">Next meeting: {new Date(team.nextMeeting).toLocaleString()}</p>
                </div>
                <p className="text-sm text-muted-foreground">Recent activity: {team.recentActivity}</p>
              </div>
            </CardContent>
          </Card>
        ))} */}
        {myTeams.map((team) => {
          const teamColor = team.themeColor;

          const textColor = getTextColorBasedOnBackground(teamColor);
          console.log("from-[" + teamColor + "30" + "]" + " " + "to-[" + teamColor + "]")
          return (
            <Link href={`/dashboard/team/${team._id}`}  key={team._id}>
              <Card className="overflow-hidden">
                <CardHeader style={{ background: `linear-gradient(to left, ${teamColor}90, ${teamColor})` }} className="p-4">
                  <CardTitle className="text-2xl" style={{ color: textColor }}>{team.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Tasks Progress</p>
                      {/* <Progress value={(team.tasks.filter(task => task.column === team.boards) / team.tasks.length) * 100} className="w-32" /> */}
                    </div>
                    <Badge variant="secondary" className="flex items-center">
                      <MessageCircle className="mr-1 h-4 w-4" />
                      15 unread
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <div className="flex items-center mb-2">
                        <Users className="mr-2 h-5 w-5" style={{ color: teamColor }}/>
                        <p className="text-sm font-semibold">Team Members</p>
                      </div>
                      <div className="flex -space-x-2">
                        {team.users.slice(0, 3).map((member) => (
                          <div key={member.user._id} className="relative">
                            <Avatar className="border-2 border-white">
                              <AvatarImage className="aspect-auto" src={member.user.profilePicture} alt={member.user.name} />
                              <AvatarFallback>{member.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className={`absolute w-3 h-3 bottom-0.5 right-0.5 rounded-full ${ member.user.online ? "bg-green-500" : "bg-gray-400"}`}></div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center mb-2">
                        <BarChart2 className="mr-2 h-5 w-5" style={{ color: teamColor }}/>
                        <p className="text-sm font-semibold">Active Boards</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {team.boards.map((board) => (
                          <Badge key={board._id} variant="outline">
                            {board.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5" style={{ color: teamColor }}/>
                      {/* <p className="text-sm">Next meeting: {new Date(team.nextMeeting).toLocaleString()}</p> */}
                      <p className="text-sm">Next meeting: tomorrow</p>
                    </div>
                    {/* <p className="text-sm text-muted-foreground">Recent activity: {team.recentActivity}</p> */}
                    <p className="text-sm text-muted-foreground">Recent activity: user add new task</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            )
          }
        )}
      </div>
    </div>
  )
}

