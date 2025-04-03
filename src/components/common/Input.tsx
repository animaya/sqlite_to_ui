/**
 * Input Component
 * 
 * A reusable input component with label and helper text.
 */

import { JSX } from "preact";

interface InputProps extends JSX.HTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
}

export default function Input({
  label,
  helperText,
  error,
  fullWidth = true,
  className = "",
  ...props
}: InputProps) {
  const inputClasses = `w-full px-3 py-2 border rounded-sm text-sm
                        text-slate-900 placeholder-slate-400
                        focus:outline-none focus:ring-2 focus:ring-blue-500 
                        focus:border-blue-500
                        ${error ? "border-red-500" : "border-slate-300"}
                        ${className}`;

  return (
    <div className={`space-y-1 ${fullWidth ? "w-full" : ""}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input className={inputClasses} {...props} />
      {(helperText || error) && (
        <p className={`text-xs ${error ? "text-red-500" : "text-slate-500"}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}
