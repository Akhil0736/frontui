'use client';
import React from 'react';
import Image from 'next/image';
import {
  Users,
  Shield,
  MessageCircle,
  Settings,
  Bell,
} from 'lucide-react';

import { BentoCard, BentoGrid } from '@/components/ui/bento-grid';

const features = [
  {
    Icon: Users,
    name: 'Target Audience',
    description: 'Define who you want to engage with.',
    href: '#',
    cta: 'Configure',
    background: (
      <Image
        data-ai-hint="abstract people"
        className="absolute -right-20 -top-20 opacity-60"
        src="https://picsum.photos/800/600"
        width={800}
        height={600}
        alt="Target Audience background"
      />
    ),
    className: 'lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3',
  },
  {
    Icon: Shield,
    name: 'Engagement Limits',
    description: 'Set safe daily limits for your activity.',
    href: '#',
    cta: 'Adjust Limits',
    background: (
      <Image
        data-ai-hint="geometric patterns"
        className="absolute -right-20 -top-20 opacity-60"
        src="https://picsum.photos/800/600"
        width={800}
        height={600}
        alt="Engagement Limits background"
      />
    ),
    className: 'lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3',
  },
  {
    Icon: MessageCircle,
    name: 'AI Comments',
    description: 'Configure the style and tone of AI-generated comments.',
    href: '#',
    cta: 'Customize',
    background: (
      <Image
        data-ai-hint="futuristic interface"
        className="absolute -right-20 -top-20 opacity-60"
        src="https://picsum.photos/800/600"
        width={800}
        height={600}
        alt="AI Comments background"
      />
    ),
    className: 'lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4',
  },
  {
    Icon: Settings,
    name: 'Advanced Targeting',
    description: 'Fine-tune your strategy with advanced options.',
    href: '#',
    cta: 'Fine-tune',
    background: (
      <Image
        data-ai-hint="network nodes"
        className="absolute -right-20 -top-20 opacity-60"
        src="https://picsum.photos/800/600"
        width={800}
        height={600}
        alt="Advanced Targeting background"
      />
    ),
    className: 'lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2',
  },
  {
    Icon: Bell,
    name: 'Notifications',
    description:
      'Get notified when someone shares a file or mentions you in a comment.',
    href: '#',
    cta: 'Manage',
    background: (
      <Image
        data-ai-hint="abstract light"
        className="absolute -right-20 -top-20 opacity-60"
        src="https://picsum.photos/800/600"
        width={800}
        height={600}
        alt="Notifications background"
      />
    ),
    className: 'lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4',
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
