'use client';
import React from 'react';
import Image from 'next/image';
import {
  Bell,
  Calendar,
  FileText,
  Globe,
  Search,
} from "lucide-react";

import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";

const features = [
  {
    Icon: FileText,
    name: "Save your files",
    description: "We automatically save your files as you type.",
    href: "/",
    cta: "Learn more",
    background: <Image data-ai-hint="office documents" className="absolute -right-20 -top-20 opacity-60" src="https://picsum.photos/800/600" width={800} height={600} alt="files" />,
    className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
  },
  {
    Icon: Search,
    name: "Full text search",
    description: "Search through all your files in one place.",
    href: "/",
    cta: "Learn more",
    background: <Image data-ai-hint="magnifying glass" className="absolute -right-20 -top-20 opacity-60" src="https://picsum.photos/800/600" width={800} height={600} alt="search" />,
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
  },
  {
    Icon: Globe,
    name: "Multilingual",
    description: "Supports 100+ languages and counting.",
    href: "/",
    cta: "Learn more",
    background: <Image data-ai-hint="world map" className="absolute -right-20 -top-20 opacity-60" src="https://picsum.photos/800/600" width={800} height={600} alt="languages" />,
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
  },
  {
    Icon: Calendar,
    name: "Calendar",
    description: "Use the calendar to filter your files by date.",
    href: "/",
    cta: "Learn more",
    background: <Image data-ai-hint="desk calendar" className="absolute -right-20 -top-20 opacity-60" src="https://picsum.photos/800/600" width={800} height={600} alt="calendar" />,
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
  },
  {
    Icon: Bell,
    name: "Notifications",
    description:
      "Get notified when someone shares a file or mentions you in a comment.",
    href: "/",
    cta: "Learn more",
    background: <Image data-ai-hint="notification bell" className="absolute -right-20 -top-20 opacity-60" src="https://picsum.photos/800/600" width={800} height={600} alt="notifications" />,
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
  },
];

export default function TargetingPage() {
  return (
    <div className="min-h-screen w-full bg-background p-4">
        <BentoGrid className="lg:grid-rows-3">
            {features.map((feature) => (
                <BentoCard key={feature.name} {...feature} />
            ))}
        </BentoGrid>
    </div>
  );
}
