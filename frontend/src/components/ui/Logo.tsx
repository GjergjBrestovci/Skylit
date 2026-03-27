import logo from '../../assets/logo.png';

interface LogoProps {
  size?: number;
  className?: string;
  withText?: boolean;
  textSizeClass?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 48, className = '', withText = false, textSizeClass = 'text-xl' }) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <img
        src={logo}
        alt="Skylit Logo"
        width={size}
        height={size}
        className="rounded-xl"
        draggable={false}
      />
      {withText && (
        <span className={`font-bold tracking-tight text-text ${textSizeClass}`}>
          Skylit
        </span>
      )}
    </div>
  );
};
