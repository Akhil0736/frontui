import { Diamond } from 'lucide-react';
import Link from 'next/link';

const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'Analytics', href: '#' },
    { name: 'Settings', href: '#' },
    { name: 'Billing', href: '#' },
    { name: 'Logout', href: '#' },
];

function NavItem({ name, href, isActive }: { name: string; href: string; isActive?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 p-2 rounded-md transition-colors text-sm font-medium ${
        isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Diamond size={10} className="text-[#C441F4] fill-[#C441F4]" />
      <span>{name}</span>
    </Link>
  );
}

export default function Sidebar() {
  return (
    <aside className="w-[220px] h-screen fixed top-0 left-0 z-30 flex flex-col bg-[#0B0B0B]/[0.28] backdrop-blur-[20px] border-r border-white/[0.12] p-4">
      <h1 className="text-2xl font-semibold text-white/70 mb-8 ml-1">Luna</h1>
      <nav className="flex flex-col gap-2">
        {navLinks.map((link, i) => (
          <NavItem key={link.name} {...link} isActive={i === 0} />
        ))}
      </nav>
    </aside>
  );
}
