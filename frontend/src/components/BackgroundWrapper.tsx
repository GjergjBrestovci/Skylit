import { type ReactNode } from 'react';
import Aurora from './ui/Aurora';

interface BackgroundWrapperProps {
  children: ReactNode;
  className?: string;
}

export default function BackgroundWrapper({ children, className = '' }: BackgroundWrapperProps) {
  return (
    <div className={`relative min-h-screen ${className}`}>
      {/* Deep navy base for Aurora */}
      <div className="fixed inset-0 z-[-200] bg-[#0a0a0f] w-full h-full" />
      
      {/* Aurora Background */}
      <div className="fixed inset-0 z-[-100] w-full h-full">
        <Aurora 
          colorStops={["#8b5cf6", "#ec4899", "#6366f1"]}
          blend={0.45}
          amplitude={0.85}
          speed={0.4}
        />
      </div>
      
      {/* Slight overlay for readability */}
      <div className="fixed inset-0 bg-[#0a0a0f]/30 z-[-50]" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
