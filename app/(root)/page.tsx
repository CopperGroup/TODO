import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import Link from "next/link"

export default async function Home() {
  const user = await currentUser()

  // const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center coppergroup-gradient animate-gradient-shift relative overflow-hidden">
      <div className="z-10 text-center">
        <SignedOut>
          <h1 className="text-4xl font-bold mb-4 text-white">Copper Group Board</h1>
          <p className="text-xl mb-8 text-white/80">The best solution for your enterprise-level company</p>
          <SignInButton>
            <Button className="bg-white text-copper-900 font-semibold py-2 px-4 rounded-lg hover:bg-white/90 transition-colors">
              Sign In
            </Button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <h1 className="text-3xl font-bold mb-4 text-white">Hi, {user?.firstName}! 👋</h1>
          <p className="text-xl mb-8 text-white/80">Let&apos;s get to work</p>
          <Link href="/dashboard" className="bg-white text-copper-900 font-semibold py-2 px-4 rounded-lg hover:bg-white/90 transition-colors">
            Get to Work
          </Link>
          <div className="mt-8">
            {/* <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-12 w-12",
                },
              }}
            /> */}
          </div>
        </SignedIn>
      </div>
    </div>
  )
}

