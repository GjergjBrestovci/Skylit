import React, { type ReactNode } from 'react';

interface StepContainerProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  className?: string;
}

export const StepContainer: React.FC<StepContainerProps> = ({
  title,
  subtitle,
  children,
  className = ''
}) => {
  return (
    <div className={`min-h-screen bg-background text-text flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 ${className}`}>
      <div className="w-full max-w-6xl mx-auto space-y-6 sm:space-y-8 lg:space-y-12">
        <div className="text-center space-y-3 sm:space-y-4 animate-header-in header-first">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text">{title}</h2>
          <p className="text-lg sm:text-xl text-text/70">{subtitle}</p>
        </div>
        
        <div className="animate-content-in content-flow-1">
          {children}
        </div>
      </div>
    </div>
  );
};
