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
  startIcon?: JSX.Element;
  endIcon?: JSX.Element;
}

export default function Input({
  label,
  helperText,
  error,
  fullWidth = true,
  className = "",
  startIcon,
  endIcon,
  ...props
}: InputProps) {
  const inputClasses = `block w-full px-3 py-2 border rounded-sm text-sm
                        text-slate-900 placeholder-slate-400
                        focus:outline-none focus:ring-2 focus:ring-blue-500 
                        focus:border-blue-500
                        ${error ? "border-red-500" : "border-slate-300"}
                        ${startIcon ? "pl-10" : ""}
                        ${endIcon ? "pr-10" : ""}
                        ${className}`;

  return (
    <div className={`space-y-1 ${fullWidth ? "w-full" : ""}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        {startIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            {startIcon}
          </div>
        )}
        <input className={inputClasses} {...props} />
        {endIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
            {endIcon}
          </div>
        )}
      </div>
      {(helperText || error) && (
        <p className={`text-xs ${error ? "text-red-500" : "text-slate-500"}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}

/**
 * Textarea Component
 * 
 * A textarea variant of the Input component
 */
export function Textarea({
  label,
  helperText,
  error,
  fullWidth = true,
  className = "",
  ...props
}: JSX.HTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
}) {
  const textareaClasses = `block w-full px-3 py-2 border rounded-sm text-sm
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
      <textarea className={textareaClasses} {...props} />
      {(helperText || error) && (
        <p className={`text-xs ${error ? "text-red-500" : "text-slate-500"}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}

// Attach Textarea as a subcomponent to Input
Input.Textarea = Textarea;
