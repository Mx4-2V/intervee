import { forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  fullWidth?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-intervee-connect hover:bg-intervee-connect-hover border-b-4 border-intervee-hero-to text-white",
  secondary:
    "border border-intervee-card-border bg-intervee-card-strong/10 text-white hover:bg-intervee-card-strong/15",
  danger:
    "bg-intervee-news border-intervee-border border-b-4 text-white",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-sm font-semibold uppercase",
  md: "px-5 py-3 text-sm font-semibold uppercase",
  lg: "px-6 py-3 text-sm font-semibold uppercase",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = "",
      disabled,
      fullWidth,
      size = "md",
      variant = "primary",
      ...props
    },
    ref,
  ) => {
    return (
      <button
        className={`${variantClasses[variant]} ${sizeClasses[size]} transition ${fullWidth ? "block w-full text-center" : ""} ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"} ${className}`}
        disabled={disabled}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };