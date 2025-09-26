import React from 'react';
import Aurora from './ui/Aurora';

interface BackgroundWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export default function BackgroundWrapper({ children, className = '' }: BackgroundWrapperProps) {
  return (
    <div className={`relative min-h-screen ${className}`}>
      {/* Aurora Background */}
      <div className="fixed inset-0 z-[-100] w-full h-full">
        <Aurora 
          colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
          blend={0.8}
          amplitude={1.2}
          speed={0.6}
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
