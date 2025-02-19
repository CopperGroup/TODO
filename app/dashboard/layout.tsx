import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/toaster";
import { TeamPlanProvider } from "./team/[id]/TeamPlanProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title:"TODO app",
  description: "TODO list for Copper Group studio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
      <TeamPlanProvider>
        <body>
          <main>
            {children}
            <Toaster />
          </main>
        </body>
      </TeamPlanProvider>
      </html>
    </ClerkProvider>
  );
}
