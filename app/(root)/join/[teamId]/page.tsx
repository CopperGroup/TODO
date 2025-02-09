import JoinTeamAnimatedBackground from "@/components/backgrounds/JoinTeamAnimatedBackground";
import { JoinTeamButton } from "@/components/interface/JoinTeamButton";
import { fetchTeamName } from "@/lib/actions/team.actions";

export default async function JoinTeamPage({ params }: { params: { teamId: string } }) {
  if (!params.teamId) {
    return null;
  }

  const teamName = await fetchTeamName({ teamId: params.teamId })

  const description =`You're just one step away from joining the ${teamName} team! By joining this team, you'll gain access to all its boards, tasks, and collaborative tools.`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900 relative overflow-hidden">
      <JoinTeamAnimatedBackground />
      <div className="z-10 w-full max-w-md p-8 rounded-lg bg-neutral-800 border border-neutral-700 shadow-xl">
        <h1 className="text-3xl font-bold text-neutral-100 mb-4">Join <span className="coppergroup-gradient-text">{teamName}</span> Team</h1>
        <p className="text-neutral-300 text-sm mb-6">{description}</p>
        <div className="space-y-4">
          <JoinTeamButton teamId={params.teamId}/>
        </div>
      </div>
    </div>
  );
}
