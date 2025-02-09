import JoinTeamAnimatedBackground from "@/components/backgrounds/JoinTeamAnimatedBackground";
import BackToDashboardButton from "@/components/interface/BackToDashboardButton";

export default async function JoinTeamPage() {
  const description = `Hey, your team has received your request. They will review it and get back to you soon. You will be notified once your request is accepted or declined.`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-900 relative overflow-hidden">
      <JoinTeamAnimatedBackground />
      <div className="z-10 w-full max-w-md p-8 rounded-lg bg-neutral-800 border border-neutral-700 shadow-xl">
        <h1 className="text-3xl font-bold text-neutral-100 mb-4">Request Sent</h1>
        <p className="text-neutral-300 text-sm mb-6">{description}</p>
        <div className="space-y-4">
          <BackToDashboardButton />
        </div>
      </div>
    </div>
  );
}
