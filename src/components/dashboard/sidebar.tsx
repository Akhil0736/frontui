"use client";
import { Home, BarChart2, Settings, CreditCard, LogOut, Zap } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Analytics', href: '/analytics', icon: BarChart2 },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Billing', href: '/billing', icon: CreditCard },
    { name: 'Logout', href: '/logout', icon: LogOut },
];

function NavItem({ name, href, icon: Icon, isActive }: { name: string; href: string; icon: React.ElementType; isActive?: boolean }) {
  return (
    <Link
      href={href}
      title={name}
      className={`flex items-center justify-center p-3 rounded-md transition-colors text-sm font-medium ${
        isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon size={20} className="text-[#00FFFF] drop-shadow-[0_0_5px_#00FFFF]" />
      <span className="sr-only">{name}</span>
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-[80px] h-screen fixed top-0 left-0 z-30 flex flex-col items-center bg-[#0B0B0B]/[0.28] backdrop-blur-[20px] border-r border-white/[0.12] p-4">
      <div className="p-2 mb-6">
        <Zap size={28} className="text-white/80" />
      </div>
      <nav className="flex flex-col gap-3">
        {navLinks.map((link) => (
          <NavItem key={link.name} {...link} isActive={pathname === link.href} />
        ))}
      </nav>
    </aside>
  );
}
