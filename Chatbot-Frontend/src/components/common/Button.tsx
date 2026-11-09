import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  // Taste-skill: Minimum 44px tap target on mobile, button-press scale effect
  const baseClasses =
    'relative inline-flex items-center justify-center font-medium transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none button-press min-h-[44px] min-w-[44px] select-none';

  const sizeClasses = {
    sm: 'text-sm px-3.5 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm px-4 py-2.5 rounded-lg gap-2',
    lg: 'text-base px-6 py-3 rounded-xl gap-2.5',
  };

  const variantClasses = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm active:bg-emerald-800',
    secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 active:bg-zinc-300 border border-zinc-200',
    outline: 'bg-transparent text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200 border border-zinc-300',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm active:bg-rose-800',
    ghost: 'bg-transparent text-zinc-600 hover:bg-zinc-100 active:bg-zinc-200',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        icon && <span className="inline-flex shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
