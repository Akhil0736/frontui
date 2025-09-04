
'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Sidebar, SidebarBody, SidebarLink, ExpandableSidebarLink } from '@/components/ui/sidebar';
import {
  Home as HomeIcon,
  Settings,
  CreditCard,
  LogOut,
  BarChart,
  Sun,
  Moon,
  Target,
  ChevronRight
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';
import { useChatContext } from '@/context/ChatContext';

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours} hours ago`;
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)} weeks ago`;
}


const Logo = () => {
  return (
    <Link
      href="/"
      className="font-luna flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-proxima-semibold text-black dark:text-white whitespace-pre tracking-wide text-base"
      >
        LUNA
      </motion.span>
    </Link>
  );
};

const LogoIcon = () => {
  return (
    <Link
      href="/"
      className="font-normal flex space-x-2 items-center text-sm text-black dark:text-white py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};

export default function AppLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { chatThreads, createNewChat } = useChatContext();

  const handleNewChat = (chatId: string) => {
    console.log('New chat created:', chatId);
  };
  
  const chatThreadsForSidebar = chatThreads.map(chat => ({
    label: chat.title,
    href: `/chat/${chat.id}`,
    timestamp: formatTimeAgo(chat.updatedAt)
  }));

  const showActionsTest = process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_SHOW_ACTIONS_TEST === 'true';

  const baseLinks = [
    {
      label: 'Home',
      href: '/',
      icon: (
        <HomeIcon className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      subItems: chatThreadsForSidebar
    },
    {
      label: 'Analytics',
      href: '/analytics',
      icon: (
        <BarChart className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: 'Targeting',
      href: '/targeting',
      icon: (
        <Target className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: (
        <Settings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: 'Billing',
      href: '/billing',
      icon: (
        <CreditCard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: 'Logout',
      href: '/logout',
      icon: (
        <LogOut className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];

  const links = showActionsTest
    ? [
        ...baseLinks.slice(0, 4),
        {
          label: 'Actions Test',
          href: '/actions-test',
          icon: (
            <Target className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
          ),
        },
        ...baseLinks.slice(4),
      ]
    : baseLinks;

  return (
    <div className="flex h-screen w-full bg-transparent">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                link.subItems ? (
                  <ExpandableSidebarLink 
                    key={idx} 
                    link={link} 
                    onNewChat={handleNewChat}
                  />
                ) : (
                  <SidebarLink key={idx} link={link} />
                )
              ))}
            </div>
          </div>
          <div>
            <div
              className={`flex items-center gap-2 ${
                !open && 'justify-center'
              }`}
            >
              <Sun className="h-5 w-5 text-neutral-700 dark:text-neutral-200" />
              <AnimatePresence>
                {open && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-neutral-700 dark:text-neutral-200 text-sm whitespace-pre"
                  >
                    <Switch
                      checked={theme === 'dark'}
                      onCheckedChange={(checked) =>
                        setTheme(checked ? 'dark' : 'light')
                      }
                    />
                  </motion.span>
                )}
              </AnimatePresence>
              <Moon className="h-5 w-5 text-neutral-700 dark:text-neutral-200" />
            </div>
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex-1 h-screen overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
