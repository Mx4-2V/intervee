interface StatusPillProps {
  label: string;
  tone: "danger" | "neutral" | "success";
}

const toneClasses = {
  success: "border-intervee-border bg-intervee-action text-white",
  danger: "border-intervee-border bg-intervee-news text-white",
  neutral: "border-intervee-border bg-intervee-page-soft text-intervee-primary",
} as const;

export function StatusPill({ label, tone }: StatusPillProps) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.16em] uppercase ${toneClasses[tone]}`}>
      {label}
    </span>
  );
}