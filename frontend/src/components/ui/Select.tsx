import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, hint, icon, className, id, disabled, children, ...props }, ref) => {
    const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-semibold uppercase tracking-wider text-text-secondary flex items-center justify-between"
          >
            <span>{label}</span>
            {hint && <span className="text-[11px] font-normal text-text-muted lowercase tracking-normal">{hint}</span>}
          </label>
        )}

        <div className="relative flex items-center w-full">
          {icon && (
            <div className="absolute left-3.5 flex items-center justify-center text-text-muted pointer-events-none">
              {icon}
            </div>
          )}

          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={cn(
              'input-field appearance-none cursor-pointer pr-10',
              icon && 'pl-10',
              error && 'border-red-500/60 focus:border-red-500 focus:ring-1 focus:ring-red-500/20',
              disabled && 'opacity-50 cursor-not-allowed',
              className
            )}
            style={{
              backgroundColor: 'rgba(17, 24, 39, 0.9)',
            }}
            {...props}
          >
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className="bg-[#111827] text-text-primary py-2"
              >
                {opt.label}
              </option>
            ))}
            {children}
          </select>

          {/* Chevron Icon */}
          <div className="absolute right-3.5 pointer-events-none text-text-muted">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {error && (
          <p className="text-xs font-medium text-[#FF5A5A] mt-0.5">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
