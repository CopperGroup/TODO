"use client";

import { useState } from "react";
import { FaFire } from "react-icons/fa";
import { FiPlus, FiTrash } from "react-icons/fi";
import { motion } from "framer-motion"
import Board from "@/components/KanBoard/Board";

interface Card {
  title: string; 
  id: string; 
  column: string
}

export default function Page() {
  return (
    <main className="h-screen w-full bg-neutral-900 text-neutral-50">
      <Board />
    </main>
  );
}
