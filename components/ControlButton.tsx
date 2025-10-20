import React from 'react';

interface ControlButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const ControlButton: React.FC<ControlButtonProps> = ({
  children,
  variant = 'primary',
  ...props
}) => {
  const baseClasses = 'rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4';
  
  const variantClasses = {
    primary: 'w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 focus:ring-blue-500/50 shadow-lg shadow-blue-500/30',
    secondary: 'w-20 h-20 bg-gray-700 hover:bg-gray-600 focus:ring-gray-600/50',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`} {...props}>
      {children}
    </button>
  );
};