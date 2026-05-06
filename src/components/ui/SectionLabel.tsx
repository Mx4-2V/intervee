interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
  color?: "muted" | "primary" | "ink";
  size?: "xs" | "sm" | "md";
  tracking?: "normal" | "wide";
}

const colorClasses = {
  muted: "text-intervee-text-soft",
  primary: "text-intervee-primary",
  ink: "text-intervee-ink",
} as const;

const sizeClasses = {
  xs: "text-[0.68rem]",
  sm: "text-xs",
  md: "text-[0.72rem]",
} as const;

const trackingClasses = {
  normal: "tracking-[0.16em]",
  wide: "tracking-[0.2em]",
} as const;

export function SectionLabel({
  children,
  className = "",
  color = "muted",
  size = "md",
  tracking = "normal",
}: SectionLabelProps) {
  return (
    <p
      className={`${colorClasses[color]} ${sizeClasses[size]} ${trackingClasses[tracking]} font-semibold uppercase ${className}`}
    >
      {children}
    </p>
  );
}