import { forwardRef } from "react";

type InputVariant = "default" | "login";

interface InputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "size"
  > {
  label?: string;
  size?: never;
  variant?: InputVariant;
}

const defaultClasses =
  "bg-intervee-page border-intervee-border mt-1 w-full border px-2 py-2 text-sm text-intervee-ink";
const loginClasses =
  "bg-intervee-input w-full border-none px-4 py-2 text-intervee-ink opacity-60";

const variantClasses: Record<InputVariant, string> = {
  default: defaultClasses,
  login: loginClasses,
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, variant = "default", ...props }, ref) => {
    if (!label) {
      return (
        <input
          className={`${variantClasses[variant]} ${className}`}
          ref={ref}
          {...props}
        />
      );
    }

    return (
      <label className="text-intervee-text-soft text-xs">
        {label}
        <input
          className={`${variantClasses[variant]} ${className}`}
          ref={ref}
          {...props}
        />
      </label>
    );
  },
);

Input.displayName = "Input";

export { Input };
export type { InputProps, InputVariant };