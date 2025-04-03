/**
 * Button Component
 * 
 * A reusable button component with different variants and sizes.
 */

import { JSX } from "preact";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends JSX.HTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  icon?: JSX.Element;
}

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  isLoading = false,
  icon,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  // Base classes for all buttons
  const baseClasses = "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed";
  
  // Size classes
  const sizeClasses = {
    sm: "px-2.5 py-1.5 text-xs rounded-sm",
    md: "px-4 py-2 text-sm rounded",
    lg: "px-6 py-3 text-base rounded-md"
  };
  
  // Variant classes
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 border border-transparent",
    secondary: "bg-white text-slate-900 hover:bg-slate-50 active:bg-slate-100 border border-slate-300",
    tertiary: "bg-transparent text-blue-600 hover:bg-blue-50 active:bg-blue-100 border border-transparent",
    danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 border border-transparent"
  };
  
  // Width classes
  const widthClasses = fullWidth ? "w-full" : "";
  
  // Loading state
  const isDisabled = isLoading || disabled;
  
  return (
    <button
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${widthClasses}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            stroke-width="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
}
