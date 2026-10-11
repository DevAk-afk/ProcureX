import React from 'react';

interface ScoreRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  strokeColor?: string;
  showSubtitle?: boolean;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  size = 'md',
  strokeColor = '#16B5A5',
  showSubtitle = true,
}) => {
  const clampedScore = Math.min(100, Math.max(0, Math.round(score)));
  const radius = 15.9155;
  const circumference = 2 * Math.PI * radius; // 100
  const dashArray = `${clampedScore}, 100`;

  const sizeClasses = {
    sm: 'w-14 h-14',
    md: 'w-20 h-20',
    lg: 'w-24 h-24',
  };

  const textClasses = {
    sm: 'text-sm font-bold',
    md: 'text-xl font-extrabold',
    lg: 'text-2xl font-black',
  };

  const subClasses = {
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
  };

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]}`}>
      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90 transform">
        {/* Background gray circle */}
        <path
          className="stroke-[#EBF2F3]"
          strokeWidth="3.2"
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        {/* Foreground teal score ring */}
        <path
          stroke={strokeColor}
          strokeWidth="3.2"
          strokeDasharray={dashArray}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-1000 ease-out"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </svg>
      {/* Centered Score Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
        <span className={`text-slate-800 tracking-tight leading-none ${textClasses[size]}`}>
          {clampedScore}
        </span>
        {showSubtitle && (
          <span className={`text-slate-400 font-medium leading-none mt-0.5 ${subClasses[size]}`}>
            /100
          </span>
        )}
      </div>
    </div>
  );
};
