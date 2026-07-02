// components/ui/Input.tsx

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-base font-medium text-foreground">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-3 py-2 text-sm rounded-lg border bg-surface
            placeholder:text-muted text-foreground
            outline-none transition-colors duration-150
            focus:ring-2 focus:ring-accent focus:border-transparent
            disabled:bg-muted/10 disabled:cursor-not-allowed
            ${error ? "border-danger" : "border-border"}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-xs text-danger">{error}</p>}
        {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";