import type { ReactNode } from 'react';

interface NavbarProps {
  children?: ReactNode;
}

export function Navbar({ children }: NavbarProps) {
  return (
    <nav className="bg-[#1b1b1b] border-b border-accent-purple/20 px-6 h-14 flex items-center justify-between">
      <h1 className="text-lg font-semibold text-accent-cyan tracking-wide">
        skylit.ai
      </h1>
      <div className="flex items-center gap-4">
        {children}
        <div className="w-8 h-8 rounded-full bg-accent-purple/30" />
      </div>
    </nav>
  );
}
