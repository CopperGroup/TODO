"use server";

import { AdminBreadcrumb } from "@/components/admin-components/AdminBreadcrumb"
import { AdminSidebar } from "@/components/admin-components/AdminSidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { fetchSidebarInfo } from "@/lib/actions/team.actions";
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation";
import type React from "react" // Added import for React
import { TeamPlanProvider } from "./TeamPlanProvider";

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode,
  params: Promise<{ id: string }>
}>) {

  const teamId = (await params).id;

  const clerkUser = await currentUser();

  const { user, teams } = await fetchSidebarInfo({ clerkId: clerkUser?.id})

  const currentTeam = await teams.find(team => team.teamId === teamId)

  if (!currentTeam || !currentTeam.members.map(member => member.user.toString()).includes(user._id.toString())) {
    redirect('/dashboard')
  }
  

  return (
      <section className="flex h-screen overflow-hidden">
        <TeamPlanProvider>
          <SidebarProvider>
              <AdminSidebar teams={teams} user={user}/>
              <main className="w-full flex-1 overflow-auto custom-scrollbar-blue">
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 bg-white">
                <AdminBreadcrumb teams={teams} />
                </header>
                <div className="flex-1">{children}</div>
            </main>
          </SidebarProvider>
        </TeamPlanProvider>
      </section>
  )
}

