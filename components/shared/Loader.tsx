"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Users } from "lucide-react"

export default function Loader () {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="relative w-48 h-48">
        <div className="absolute inset-2 coppergroup-gradient rounded-full flex items-center justify-center">
          <Users className="w-24 h-24 text-gray-100" />
        </div>
      </div>

      <div className="mt-8 relative">
        <div className="coppergroup-border rounded-lg overflow-hidden">
          <div className="px-6 py-3">
            <p className="text-amber-500 text-xl font-semibold">Loading your teams</p>
          </div>
        </div>
      </div>

      <div className="mt-8 w-64 h-1 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 coppergroup-gradient"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  )
}

