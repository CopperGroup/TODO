"use client"

import React from 'react'
import { motion } from 'framer-motion'

const CreateBoardAnimatedBackground = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 1000 400">
        <defs>
          <linearGradient id="copperGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(102, 46, 0, 1)" />
            <stop offset="25%" stopColor="rgba(212, 120, 0, 0.9)" />
            <stop offset="50%" stopColor="rgba(255, 179, 102, 0.7)" />
            <stop offset="75%" stopColor="rgba(212, 120, 0, 0.9)" />
            <stop offset="100%" stopColor="rgba(102, 46, 0, 1)" />
          </linearGradient>
          <motion.path
            id="infinity"
            d="M0 200 C 250 100 250 300 500 200 C 750 100 750 300 1000 200"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 5,
              ease: "linear",
              repeat: Infinity,
            }}
          />
        </defs>
        <use href="#infinity" stroke="url(#copperGradient)" strokeWidth="1" fill="none" />
        <use href="#infinity" stroke="url(#copperGradient)" strokeWidth="1" fill="none" strokeDasharray="10 5">
          <animate 
            attributeName="stroke-dashoffset" 
            values="0;100;0" 
            dur="2s" 
            repeatCount="indefinite" 
            keyTimes="0;0.5;1"
          />
          <animate 
            attributeName="stroke-opacity" 
            values="1;0;1" 
            dur="2s" 
            repeatCount="indefinite" 
            keyTimes="0;0.5;1"
          />
        </use>
      </svg>
    </div>
  )
}

export default CreateBoardAnimatedBackground
