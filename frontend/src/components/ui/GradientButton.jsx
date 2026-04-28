import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const GradientButton = ({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md',
  ...props 
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-primary-600 via-primary-500 to-tertiary-500 text-white shadow-[0_8px_24px_-4px_rgba(79,70,229,0.4)] hover:shadow-[0_12px_28px_-4px_rgba(79,70,229,0.5)] hover:-translate-y-0.5',
    secondary: 'bg-surface-highest text-primary-600 hover:bg-surface-high',
    ghost: 'bg-transparent text-on-surface hover:bg-surface-container',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-xl gap-2',
    md: 'px-6 py-3 text-base rounded-2xl gap-2.5',
    lg: 'px-8 py-4 text-lg rounded-2xl gap-3',
  };

  return (
    <button
      className={cn(
        'font-bold font-[family-name:var(--font-display)] inline-flex items-center justify-center transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default GradientButton;
