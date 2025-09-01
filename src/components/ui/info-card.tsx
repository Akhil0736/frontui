
"use client"

import { Star, MessageCircle, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"

type ProfileCardProps = {
  children: React.ReactNode;
  title?: string;
  status?: "online" | "offline" | "away"
  avatar?: string
  tags?: string[]
  isVerified?: boolean
  followers?: number
}

export function ProfileCard({ children, title }: ProfileCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-3xl bg-white dark:bg-gray-800 p-6 w-full shadow-[12px_12px_24px_rgba(0,0,0,0.15),-12px_-12px_24px_rgba(255,255,255,0.9)] dark:shadow-[12px_12px_24px_rgba(0,0,0,0.3),-12px_-12px_24px_rgba(255,255,255,0.1)] transition-all duration-500 hover:shadow-[20px_20px_40px_rgba(0,0,0,0.2),-20px_-20px_40px_rgba(255,255,255,1)] dark:hover:shadow-[20px_20px_40px_rgba(0,0,0,0.4),-20px_-20px_40px_rgba(255,255,255,0.15)] hover:scale-105 hover:-translate-y-2">
      {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-4">{title}</h3>}
      {children}
      <div className="absolute inset-0 rounded-3xl border border-blue-200 dark:border-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    </div>
  )
}
