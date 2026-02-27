import logo from '../../assets/logo.png';

interface LogoProps {
  size?: number;
  className?: string;
  withText?: boolean;
  textSizeClass?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 48, className = '', withText = false, textSizeClass = 'text-xl' }) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <img
        src={logo}
        alt="Skylit Logo"
        width={size}
        height={size}
        className="rounded-[22%] shadow-lg shadow-accent-primary/15"
        draggable={false}
      />
      {withText && (
        <span className={`font-black tracking-tight bg-gradient-to-r from-accent-primary via-accent-secondary to-pink-400 bg-clip-text text-transparent ${textSizeClass}`}>
          Skylit
        </span>
      )}
    </div>
  );
};
