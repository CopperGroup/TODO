import { AdminBreadcrumb } from "@/components/admin-components/AdminBreadcrumb"
import { AdminSidebar } from "@/components/admin-components/AdminSidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import type React from "react" // Added import for React

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
      <section className="flex h-screen overflow-hidden">
        <SidebarProvider>
            <AdminSidebar />
            <main className="w-full flex-1 overflow-auto">
              <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 bg-white">
              <AdminBreadcrumb />
              </header>
              <div className="flex-1 overflow-auto">{children}</div>
          </main>
        </SidebarProvider>
      </section>
  )
}

