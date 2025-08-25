import React from 'react';

interface DividoLogoProps {
  className?: string;
  size?: number;
  variant?: 'default' | 'white' | 'blue';
}

export const DividoLogo: React.FC<DividoLogoProps> = ({ 
  className = "", 
  size = 32,
  variant = 'default'
}) => {
  const getColors = () => {
    switch (variant) {
      case 'white':
        return { bg: 'white', stroke: '#2563EB', dots: '#2563EB' };
      case 'blue':
        return { bg: '#2563EB', stroke: 'white', dots: 'white' };
      default:
        return { bg: '#2563EB', stroke: 'white', dots: 'white' };
    }
  };

  const colors = getColors();

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background circle */}
      <circle cx="16" cy="16" r="16" fill={colors.bg}/>
      
      {/* Division symbol with modern styling */}
      <path d="M8 12h16M8 20h16" stroke={colors.stroke} strokeWidth="2.5" strokeLinecap="round"/>
      
      {/* Small dots representing items being divided */}
      <circle cx="12" cy="10" r="1.5" fill={colors.dots}/>
      <circle cx="20" cy="10" r="1.5" fill={colors.dots}/>
      <circle cx="12" cy="22" r="1.5" fill={colors.dots}/>
      <circle cx="20" cy="22" r="1.5" fill={colors.dots}/>
    </svg>
  );
};
