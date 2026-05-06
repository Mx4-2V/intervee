interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

export function PageShell({ children, className = "" }: PageShellProps) {
  return (
    <main className={`bg-intervee-page text-intervee-ink min-h-screen ${className}`}>
      {children}
    </main>
  );
}