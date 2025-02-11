import { currentUser } from "@clerk/nextjs/server"
import MembersActionButtons from "@/components/interface/members/MembersActionButtons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { fetchTeamMembers } from "@/lib/actions/team.actions"
import type { UserType } from "@/lib/models/user.model"
import AddMembers from "@/components/interface/members/AddMembers"

type MemberType = {
    user: UserType,
    role: 'Admin' | 'Member'
}
const TeamMembersPage = async ({ params }: { params: { id: string } }) => {
  const user = await currentUser()

  if (!params.id) return null

  const team = await fetchTeamMembers({ teamId: params.id })
  const isAdmin = team.members.some((member: MemberType) => member.user.clerkId === user?.id && member.role === "Admin")

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Team Members</h1>
        <AddMembers 
            teamId={params.id} 
            isAdmin={isAdmin} 
            existingMembers={team.members.map((m: MemberType) => ({
                _id: m.user._id,
                name: m.user.name,
                email: m.user.email
            }))}
        />
      </div>
      <div className="">
        {team.members.map((member: { user: UserType; role: "Admin" | "Member" }) => (
          <div
            key={member.user._id}
            className="flex items-center justify-between p-4 bg-white w-full hover:bg-neutral-100"
          >
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={member.user.profilePicture || ""} alt={member.user.name} />
                <AvatarFallback>{member.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{member.user.name}</p>
                <p className="text-sm text-gray-500">{member.user.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100">{member.role}</span>
              <MembersActionButtons teamId={team._id} memberId={member.user._id} role={member.role} isAdmin={isAdmin} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TeamMembersPage

