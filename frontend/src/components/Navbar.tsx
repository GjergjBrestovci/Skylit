import type { ReactNode } from 'react';

interface NavbarProps {
  children?: ReactNode;
  onLogout?: () => void;
}

export function Navbar({ children, onLogout }: NavbarProps) {
  return (
    <nav className="bg-[#1b1b1b] border-b border-accent-purple/20 px-6 h-14 flex items-center justify-between">
      <h1 className="text-lg font-semibold text-accent-cyan tracking-wide">
        skylit.ai
      </h1>
      <div className="flex items-center gap-4">
        {children}
        {onLogout && (
          <button
            onClick={onLogout}
            className="text-sm text-accent-purple hover:text-accent-purple/80 px-3 py-1 rounded-md border border-accent-purple/30 hover:border-accent-purple/50"
          >
            Logout
          </button>
        )}
        <div className="w-8 h-8 rounded-full bg-accent-purple/30" />
      </div>
    </nav>
  );
}
