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
          className={`group relative p-4 sm:p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
            selectedStack === stack.value
              ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
              : 'border-border bg-surface dark:bg-surface hover:border-blue-300 dark:hover:border-blue-600'
          }`}
        >
          {/* Badge for complexity */}
          <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
            stack.complexity === 'Beginner'
              ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : stack.complexity === 'Intermediate'
              ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {stack.complexity}
          </div>

          {/* Stack header */}
          <div className="mb-4 space-y-2">
            <div className="text-2xl">{stack.icon}</div>
            <h3 className="text-lg sm:text-xl font-bold text-text group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
              {stack.name}
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              {stack.description}
            </p>
          </div>

          {/* Tech details */}
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-blue-600 dark:text-blue-400 font-medium">Frontend:</span>
              <span className="ml-2 text-text">{stack.frontend}</span>
            </div>

            {stack.backend && (
              <div>
                <span className="text-purple-600 dark:text-purple-400 font-medium">Backend:</span>
                <span className="ml-2 text-text">{stack.backend}</span>
              </div>
            )}

            {stack.database && (
              <div>
                <span className="text-pink-600 dark:text-pink-400 font-medium">Database:</span>
                <span className="ml-2 text-text">{stack.database}</span>
              </div>
            )}

            <div>
              <span className="text-green-600 dark:text-green-400 font-medium">Deploy:</span>
              <span className="ml-2 text-text">{stack.deployment}</span>
            </div>
          </div>

          {/* Features */}
          {stack.features && stack.features.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border">
              <div className="text-xs text-muted">
                <span className="font-medium">Includes:</span>
                <span className="ml-1">{stack.features.join(', ')}</span>
              </div>
            </div>
          )}

          {/* Selection indicator */}
          {selectedStack === stack.value && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 dark:bg-blue-400 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold">✓</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
