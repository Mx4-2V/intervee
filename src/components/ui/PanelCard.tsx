interface PanelCardProps {
  children: React.ReactNode;
  className?: string;
  overflow?: boolean;
  padding?: "sm" | "md" | "lg";
}

const paddingClasses = {
  sm: "p-4",
  md: "p-5",
  lg: "p-6 sm:p-8",
} as const;

export function PanelCard({
  children,
  className = "",
  overflow = false,
  padding = "md",
}: PanelCardProps) {
  return (
    <section
      className={`bg-intervee-surface border-intervee-border border-2 ${paddingClasses[padding]} text-white shadow-md ${overflow ? "overflow-hidden" : ""} ${className}`}
    >
      {children}
    </section>
  );
}