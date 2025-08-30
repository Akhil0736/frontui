
'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import BlurFade from '@/components/ui/blur-fade';

interface LunaLogoProps {
  className?: string;
}

export default function LunaLogo({ className }: LunaLogoProps = {}) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative">
        {/* Background glow layers */}
        <div className="absolute inset-0 -m-20">
          <motion.div
            className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(251, 207, 232, 0.3) 0%, rgba(251, 207, 232, 0.1) 40%, transparent 70%)',
              filter: 'blur(40px)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(244, 114, 182, 0.4) 0%, rgba(244, 114, 182, 0.2) 50%, transparent 80%)',
              filter: 'blur(30px)',
            }}
            animate={{
              scale: [1.1, 0.9, 1.1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(236, 72, 153, 0.5) 0%, rgba(236, 72, 153, 0.3) 60%, transparent 90%)',
              filter: 'blur(20px)',
            }}
            animate={{
              scale: [0.8, 1.3, 0.8],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </div>

        {/* Main LUNA text */}
        <BlurFade delay={0.2} duration={1.2} inView>
          <motion.h1
            className="relative z-10 text-8xl md:text-9xl lg:text-[12rem] font-bold tracking-wider text-transparent bg-clip-text"
            style={{
              backgroundImage: 'linear-gradient(135deg, #fce7f3 0%, #f9a8d4 25%, #f472b6 50%, #ec4899 75%, #be185d 100%)',
              textShadow: '0 0 40px rgba(244, 114, 182, 0.3), 0 0 80px rgba(236, 72, 153, 0.2)',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            LUNA
          </motion.h1>
        </BlurFade>

        {/* Subtle sparkle effects */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-pink-300 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 40}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute w-0.5 h-0.5 bg-pink-200 rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -40, -20],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}
