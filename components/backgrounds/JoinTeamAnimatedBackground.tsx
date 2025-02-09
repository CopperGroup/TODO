"use client"
import { motion } from "framer-motion"

const JoinTeamAnimatedBackground = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      <svg
        className="absolute w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 1000 1000"
      >
        <defs>
          <linearGradient id="copperGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(102, 46, 0, 1)" />
            <stop offset="25%" stopColor="rgba(212, 120, 0, 0.9)" />
            <stop offset="50%" stopColor="rgba(255, 179, 102, 0.7)" />
            <stop offset="75%" stopColor="rgba(212, 120, 0, 0.9)" />
            <stop offset="100%" stopColor="rgba(102, 46, 0, 1)" />
          </linearGradient>
        </defs>

        {/* Animated copper lines */}
        <motion.path
          d="M0 300 Q 150 150, 300 300 T 600 300 T 900 300 T 1200 300"
          stroke="url(#copperGradient)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", ease: "easeInOut" }}
        />
        <motion.path
          d="M0 500 Q 150 350, 300 500 T 600 500 T 900 500 T 1200 500"
          stroke="url(#copperGradient)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            duration: 3,
            delay: 0.5,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
        <motion.path
          d="M0 700 Q 150 550, 300 700 T 600 700 T 900 700 T 1200 700"
          stroke="url(#copperGradient)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            duration: 3,
            delay: 1,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      </svg>
    </div>
  )
}

export default JoinTeamAnimatedBackground

