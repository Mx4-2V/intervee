import Link from "next/link";

const NAV = [
  { href: "/admin", label: "Panel" },
  { href: "/admin/companies", label: "Empresas" },
  { href: "/admin/access", label: "Acceso" },
  { href: "/admin/settings/llm", label: "LLM" },
];

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#17345b_0%,_#0d1830_42%,_#060b16_100%)] text-white">
      <nav className="sticky top-0 z-10 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-5 py-3 sm:px-8">
          <span className="text-xs font-bold uppercase tracking-widest text-intervee-text-soft">
            Admin
          </span>
          <div className="flex gap-1">
            {NAV.map(({ href, label }) => (
              <Link
                className="rounded px-3 py-1.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
                href={href}
                key={href}
              >
                {label}
              </Link>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-4">
            <Link
              className="rounded border border-white/20 px-3 py-1 text-xs text-white/60 transition hover:border-white/40 hover:text-white"
              href="/api/auth/signout"
            >
              Cerrar sesión
            </Link>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
