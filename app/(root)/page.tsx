import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { Shield } from "lucide-react"
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"

export default function HeroSection() {
  return (
    <div className="min-h-screen bg-[#eae5e4]">
      <div className="container mx-auto px-4 py-12 min-h-screen flex flex-col justify-center">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div className="space-y-8 pl-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-tight">
              <span className="coppergroup-gradient-text">ΚΟΛΟΣ</span> - Unite Your Team&apos;s Strength
            </h1>
            <p className="text-xl text-black/80 leading-relaxed max-w-xl">
              Like ancient warriors, we believe in the power of organized, disciplined teams working as one.
            </p>
            <div className="pt-2">
              <SignedOut>
                <SignInButton>
                  <Button className="coppergroup-gradient px-8 text-lg text-gray-100 font-semibold rounded-md">
                    Create my Legion
                  </Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="coppergroup-gradient px-8 py-2 text-lg text-gray-100 font-semibold rounded-md">
                  Get to Work
                </Link>
              </SignedIn>
            </div>
          </div>
          <div className="relative h-[500px] lg:h-[600px]">
            <Image
              src="/Kolos.jpg"
              alt="Warrior illustration representing strength and leadership"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )
}