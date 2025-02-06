"use server";

import { AdminBreadcrumb } from "@/components/admin-components/AdminBreadcrumb"
import { AdminSidebar } from "@/components/admin-components/AdminSidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { fetchUsersTeamsIdNameColorBoards } from "@/lib/actions/team.actions"
import { currentUser } from "@clerk/nextjs/server"
import type React from "react" // Added import for React

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  
  const user = await currentUser();

  const teams = await fetchUsersTeamsIdNameColorBoards({ clerkId: user?.id})

  return (
      <section className="flex h-screen overflow-hidden">
        <SidebarProvider>
            <AdminSidebar teams={teams} />
            <main className="w-full flex-1 overflow-auto custom-scrollbar-blue">
              <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 bg-white">
              <AdminBreadcrumb teams={teams} />
              </header>
              <div className="flex-1">{children}</div>
          </main>
        </SidebarProvider>
      </section>
  )
}

