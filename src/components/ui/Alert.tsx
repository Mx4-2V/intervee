interface AlertProps {
  children: React.ReactNode;
  className?: string;
  variant?: "error" | "info" | "success" | "warning";
}

const variantClasses = {
  error: "border-rose-200 bg-rose-50 text-rose-700",
  info: "border-intervee-connect/30 bg-intervee-page-soft text-intervee-primary",
  success: "border-intervee-action/30 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
} as const;

export function Alert({ children, className = "", variant = "error" }: AlertProps) {
  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
}