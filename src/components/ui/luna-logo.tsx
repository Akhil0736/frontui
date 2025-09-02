"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LunaLogoProps {
  className?: string;
  textClassName?: string;
  glowColor?: string;
  animationDuration?: number;
}

export default function LunaLogo({
  className = "",
  textClassName = "",
  glowColor = "rgba(59, 130, 246, 0.8)",
  animationDuration = 2,
}: LunaLogoProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <motion.div
        className="relative"
        animate={{
          filter: [
            `drop-shadow(0 0 20px ${glowColor}) drop-shadow(0 0 40px ${glowColor})`,
            `drop-shadow(0 0 40px ${glowColor}) drop-shadow(0 0 80px ${glowColor})`,
            `drop-shadow(0 0 20px ${glowColor}) drop-shadow(0 0 40px ${glowColor})`,
          ],
        }}
        transition={{
          duration: animationDuration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <motion.h1
          className={cn(
            "text-8xl font-bold text-white tracking-wider select-none",
            textClassName
          )}
          animate={{
            opacity: [0.6, 1, 0.6],
            textShadow: [
              `0 0 10px ${glowColor}, 0 0 20px ${glowColor}, 0 0 30px ${glowColor}`,
              `0 0 20px ${glowColor}, 0 0 30px ${glowColor}, 0 0 40px ${glowColor}`,
              `0 0 10px ${glowColor}, 0 0 20px ${glowColor}, 0 0 30px ${glowColor}`,
            ],
          }}
          transition={{
            duration: animationDuration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          LUNA
        </motion.h1>

        <motion.div
          className="absolute inset-0 text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 tracking-wider"
          animate={{
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: animationDuration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        >
          LUNA
        </motion.div>
      </motion.div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: animationDuration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 60%)`,
          }}
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: animationDuration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3,
          }}
        />
      </div>
    </div>
  );
}
