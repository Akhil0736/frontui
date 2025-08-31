
'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LunaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'text-4xl',
  md: 'text-6xl',
  lg: 'text-8xl',
  xl: 'text-9xl'
};

export default function LunaLogo({ className, size = 'lg' }: LunaLogoProps = {}) {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Background glow effect */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.3, 0] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="absolute w-96 h-96 bg-pink-300/20 rounded-full blur-3xl" />
      </motion.div>

      {/* Secondary glow layer */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: [0, 0.4, 0],
          scale: [0.8, 1.2, 0.8]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      >
        <div className="absolute w-64 h-64 bg-pink-200/30 rounded-full blur-2xl" />
      </motion.div>

      {/* Main LUNA text */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <motion.h1
          className={cn(
            sizeClasses[size],
            "font-light tracking-[0.2em] text-center select-none",
            "bg-gradient-to-r from-pink-200 via-pink-100 to-pink-200",
            "bg-clip-text text-transparent",
            "drop-shadow-[0_0_30px_rgba(251,207,232,0.3)]"
          )}
          initial={{ 
            filter: "blur(2px) brightness(0.8)",
            textShadow: "0 0 20px rgba(251,207,232,0.5)"
          }}
          animate={{ 
            filter: [
              "blur(2px) brightness(0.8)",
              "blur(0px) brightness(1.2)",
              "blur(1px) brightness(0.9)",
              "blur(0px) brightness(1)",
              "blur(2px) brightness(0.8)"
            ],
            textShadow: [
              "0 0 20px rgba(251,207,232,0.5)",
              "0 0 40px rgba(251,207,232,0.8)",
              "0 0 30px rgba(251,207,232,0.6)",
              "0 0 35px rgba(251,207,232,0.7)",
              "0 0 20px rgba(251,207,232,0.5)"
            ]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          LUNA
        </motion.h1>

        {/* Subtle shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-100/20 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
            delay: 2
          }}
        />
      </motion.div>

      {/* Ambient particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-pink-200/40 rounded-full"
          style={{
            left: `${20 + i * 12}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
          animate={{
            opacity: [0, 0.6, 0],
            scale: [0, 1, 0],
            y: [-20, 20, -20]
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.8
          }}
        />
      ))}
    </div>
  );
}
