"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0b0f19] via-[#111827] to-[#1e1b4b] text-white flex flex-col">
      
      {/* NAVBAR */}
      <nav className="w-full flex items-center justify-between px-10 py-6">
        <div className="flex items-center gap-2 text-2xl font-bold">
          <GraduationCap size={30} className="text-purple-400" />
          TutorConnect
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="flex flex-col items-center justify-center text-center flex-1 px-6">
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-7xl font-extrabold leading-tight bg-gradient-to-r from-purple-300 to-blue-300 text-transparent bg-clip-text"
        >
          Sharing Knowledge
          <br />
          Wherever You Are
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mt-6 max-w-2xl text-xl text-gray-300"
        >
          Unlock your potential with personalized learning. Find expert tutors
          across all subjects, available 24/7 for help or scheduled sessions.
        </motion.p>

        {/* BUTTONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="flex gap-6 mt-12"
        >
          {/* REGISTER CTA */}
          <Link href="/auth/register">
            <Button className="bg-purple-500 hover:bg-purple-600 text-white px-10 py-5 text-xl rounded-full shadow-lg shadow-purple-800/30">
              Get Started
            </Button>
          </Link>

          {/* LOGIN BUTTON */}
          <Link href="/auth/login">
            <Button
              variant="outline"
              className="border-purple-400 text-purple-500 hover:bg-purple-500/20 px-10 py-5 text-xl rounded-full"
            >
              Login
            </Button>
          </Link>
        </motion.div>

        {/* Glow Accent */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-purple-900/40 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
