import { type ReactNode } from 'react';
import Aurora from './ui/Aurora';

interface BackgroundWrapperProps {
  children: ReactNode;
  className?: string;
}

export default function BackgroundWrapper({ children, className = '' }: BackgroundWrapperProps) {
  return (
    <div className={`relative min-h-screen ${className}`}>
      {/* Dark base background for Aurora */}
      <div className="fixed inset-0 z-[-200] bg-[#0a0a0a] w-full h-full" />
      
      {/* Aurora Background */}
      <div className="fixed inset-0 z-[-100] w-full h-full">
        <Aurora 
          colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        />
      </div>
      
      {/* Minimal overlay for content readability */}
      <div className="fixed inset-0 bg-black/20 z-[-50]" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
