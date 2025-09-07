import { TECH_STACKS } from '../constants/websiteOptions';

interface TechStackSelectorProps {
  selectedStack: string;
  onSelect: (stackValue: string) => void;
}

export function TechStackSelector({ selectedStack, onSelect }: TechStackSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {TECH_STACKS.map((stack) => (
        <div
          key={stack.value}
          onClick={() => onSelect(stack.value)}
          className={`group relative p-4 sm:p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
            selectedStack === stack.value
              ? 'border-accent-cyan bg-accent-cyan/10'
              : 'border-accent-purple/30 bg-[#1a1a1a] hover:border-accent-purple/60'
          }`}
        >
          {/* Badge for complexity */}
          <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
            stack.complexity === 'Beginner' 
              ? 'bg-green-500/20 text-green-400' 
              : stack.complexity === 'Intermediate'
              ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-red-500/20 text-red-400'
          }`}>
            {stack.complexity}
          </div>

          {/* Stack header */}
          <div className="mb-4 space-y-2">
            <div className="text-2xl">{stack.icon}</div>
            <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-accent-cyan transition-colors duration-300">
              {stack.name}
            </h3>
            <p className="text-sm text-text/70 leading-relaxed">
              {stack.description}
            </p>
          </div>

          {/* Tech details */}
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-accent-cyan font-medium">Frontend:</span>
              <span className="ml-2 text-text/80">{stack.frontend}</span>
            </div>
            
            {stack.backend && (
              <div>
                <span className="text-accent-purple font-medium">Backend:</span>
                <span className="ml-2 text-text/80">{stack.backend}</span>
              </div>
            )}
            
            {stack.database && (
              <div>
                <span className="text-pink-400 font-medium">Database:</span>
                <span className="ml-2 text-text/80">{stack.database}</span>
              </div>
            )}

            <div>
              <span className="text-green-400 font-medium">Deploy:</span>
              <span className="ml-2 text-text/80">{stack.deployment}</span>
            </div>
          </div>

          {/* Features */}
          {stack.features && stack.features.length > 0 && (
            <div className="mt-4 pt-3 border-t border-accent-purple/20">
              <div className="text-xs text-text/60">
                <span className="font-medium">Includes:</span>
                <span className="ml-1">{stack.features.join(', ')}</span>
              </div>
            </div>
          )}

          {/* Selection indicator */}
          {selectedStack === stack.value && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent-cyan rounded-full flex items-center justify-center">
              <span className="text-black text-sm font-bold">✓</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
