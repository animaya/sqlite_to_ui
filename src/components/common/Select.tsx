/**
 * Select Component
 * 
 * A reusable select dropdown component.
 */

import { JSX } from "preact";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<JSX.HTMLAttributes<HTMLSelectElement>, "onChange"> {
  label?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  helperText?: string;
  error?: string;
  fullWidth?: boolean;
}

export default function Select({
  label,
  options,
  value,
  onChange,
  helperText,
  error,
  fullWidth = true,
  className = "",
  ...props
}: SelectProps) {
  const selectClasses = `w-full px-3 py-2 border rounded-sm text-sm
                         text-slate-900 bg-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500 
                         focus:border-blue-500 appearance-none
                         ${error ? "border-red-500" : "border-slate-300"}
                         ${className}`;

  const handleChange = (e: JSX.TargetedEvent<HTMLSelectElement>) => {
    onChange?.(e.currentTarget.value);
  };

  return (
    <div className={`space-y-1 ${fullWidth ? "w-full" : ""}`}>
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={selectClasses}
          value={value}
          onChange={handleChange}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {/* Dropdown icon */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
          <svg
            className="h-4 w-4 fill-current"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
      {(helperText || error) && (
        <p className={`text-xs ${error ? "text-red-500" : "text-slate-500"}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}
