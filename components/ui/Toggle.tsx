import { forwardRef } from "react";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  name?: string;
  "aria-label"?: string;
  className?: string;
}

const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ checked, onChange, disabled = false, id, name, "aria-label": ariaLabel, className = "" }, ref) => {
    return (
      <label className={`relative inline-block ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${className}`}>
        <input
          ref={ref}
          type="checkbox"
          id={id}
          name={name}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          aria-label={ariaLabel}
          className="sr-only peer"
        />
        
        {/* Toggle Track */}
        <div className={`
          relative w-12 h-6 rounded-full transition-colors duration-300 ease-in-out
          ${disabled 
            ? 'bg-base-200 opacity-50' 
            : checked 
              ? 'bg-primary' 
              : 'bg-base-300'
          }
        `}>
          {/* Toggle Knob */}
          <div className={`
            absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm
            transition-all duration-300 ease-in-out
            ${checked ? 'left-6' : 'left-0.5'}
            ${!disabled && 'shadow-md'}
          `} />
        </div>
      </label>
    );
  }
);

Toggle.displayName = "Toggle";

export default Toggle;