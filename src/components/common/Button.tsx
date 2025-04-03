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
  ...props
}: ButtonProps) {
  // TODO: Implement button styling based on variant and size
  
  return (
    <button
      className={`${className} inline-flex items-center justify-center`}
      {...props}
    >
      {isLoading && <span>Loading...</span>}
      {!isLoading && icon && <span className="mr-2">{icon}</span>}
      {!isLoading && children}
    </button>
  );
}
