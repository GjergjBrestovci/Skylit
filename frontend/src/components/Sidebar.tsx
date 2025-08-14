import type { ReactNode } from 'react';

interface SidebarProps {
  children?: ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  return (
    <aside className="w-60 bg-[#181818] border-r border-accent-purple/20 min-h-[calc(100vh-3.5rem)]">
      <div className="p-4 space-y-4">
        <nav className="space-y-1 text-sm">
          <button className="w-full flex items-center gap-3 p-2 rounded-md bg-accent-purple/10 text-accent-purple font-medium text-left">
            Dashboard
          </button>
          <button className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-accent-cyan/10 text-text/80 hover:text-accent-cyan text-left transition-colors">
            Projects
          </button>
          <button className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-accent-cyan/10 text-text/80 hover:text-accent-cyan text-left transition-colors">
            Templates
          </button>
        </nav>
        {children}
      </div>
    </aside>
  );
}
