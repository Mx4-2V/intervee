interface LoadingScreenProps {
  dark?: boolean;
  subtitle?: string;
  title: string;
}

export default function LoadingScreen({
  dark = true,
  subtitle,
  title,
}: LoadingScreenProps) {
  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center ${dark ? "bg-intervee-surface text-white" : "bg-intervee-page text-intervee-ink"}`}
    >
      <div className="flex gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-3 w-3 rounded-sm"
            style={{
              animation: `intervee-block-pulse 1.2s ease-in-out ${i * 0.15}s infinite`,
              backgroundColor:
                i < 3
                  ? "var(--color-intervee-hero-from)"
                  : "var(--color-intervee-connect)",
            }}
          />
        ))}
      </div>

      <h2
        className={`mt-8 text-2xl font-bold tracking-widest uppercase ${dark ? "text-intervee-text-soft" : "text-intervee-primary"}`}
      >
        {title}
      </h2>

      {subtitle && (
        <p
          className={`mt-2 text-sm font-medium ${dark ? "text-intervee-text-soft" : "text-intervee-text-muted"}`}
        >
          {subtitle}
        </p>
      )}

      <style>{`
        @keyframes intervee-block-pulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.4); opacity: 1; }
        }
      `}</style>
    </div>
  );
}