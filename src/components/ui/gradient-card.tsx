
'use client'
import React, { ReactNode } from "react";
import { motion } from "framer-motion";

interface GradientCardProps {
    children: ReactNode;
    className?: string;
}

export const GradientCard: React.FC<GradientCardProps> = ({ children, className }) => {
  return (
      <motion.div
        className={`relative rounded-2xl overflow-hidden p-6 bg-card/80 backdrop-blur-xl border border-border shadow-lg ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10" />
        {children}
      </motion.div>
  );
};
