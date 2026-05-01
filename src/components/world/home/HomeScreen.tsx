import Image from "next/image";
import Link from "next/link";

export function HomeScreen() {
  return (
    <main className="bg-intervee-page min-h-screen text-gray-800">
      <section
        className="from-intervee-hero-from to-intervee-hero-to relative min-h-[31.25rem] overflow-hidden bg-linear-to-b pb-8 text-white"
        id="hero"
      >
        <nav className="relative z-20 border-b border-white/15 bg-black/50 shadow-xl backdrop-blur-sm">
          <div className="max-w-intervee-page mx-auto grid grid-cols-1 items-center gap-3 px-4 py-3 text-center md:grid-cols-[11.25rem_1fr_11.25rem]">
            <Image
              src="/logos/intervee_logo.png"
              alt="Intervee"
              width={180}
              height={60}
              priority
              className="drop-shadow-intervee-logo h-auto w-32 md:w-40"
            />

            <p className="justify-self-center text-sm leading-tight font-bold tracking-wide text-white uppercase md:text-lg">
              Un mundo de entrevistas
            </p>

            <button
              type="button"
              disabled
              className="bg-intervee-action cursor-not-allowed justify-self-center border-b-4 border-black px-5 py-2 text-sm font-bold tracking-wide text-white uppercase opacity-70 grayscale md:justify-self-end md:text-base"
              aria-label="Unete gratis proximamente"
            >
              Unete gratis
            </button>
          </div>
        </nav>

        <div className="max-w-intervee-page relative z-10 mx-auto mt-8 flex flex-col items-center justify-between gap-8 px-4 md:flex-row">
          <section
            aria-label="Login desactivado"
            className="shadow-intervee-panel md:w-intervee-login ml-auto w-full rounded bg-black/50 p-6"
          >
            <div className="grid grid-cols-1 gap-6">
              <div>
                <p className="mb-2 text-center text-sm text-gray-200">
                  Inicia sesion con Google
                </p>
                <button
                  className="bg-intervee-google flex w-full cursor-not-allowed items-center justify-center rounded border-b-2 border-black/30 px-4 py-2 text-sm font-bold uppercase opacity-55"
                  disabled
                  type="button"
                >
                  <span className="text-intervee-google mr-2 rounded bg-white px-1">
                    G
                  </span>
                  Google
                </button>
              </div>

              <div>
                <p className="mb-2 text-center text-sm text-gray-200">
                  O utiliza tu email y contrasena
                </p>
                <fieldset className="space-y-2">
                  <input
                    className="bg-intervee-input w-full border-none px-4 py-2 text-gray-800 opacity-60"
                    disabled
                    placeholder="Email"
                    type="email"
                  />
                  <input
                    className="bg-intervee-input w-full border-none px-4 py-2 text-gray-800 opacity-60"
                    disabled
                    placeholder="Contrasena"
                    type="password"
                  />
                  <Link
                    className="bg-intervee-connect hover:bg-intervee-connect-hover block w-full border-b-4 border-blue-900 py-3 text-center font-bold text-white uppercase transition active:translate-y-1"
                    href="/game"
                  >
                    Conectar
                  </Link>
                </fieldset>
                <p className="mt-2 text-center text-xs text-gray-300 underline">
                  Contrasena olvidada?
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>

      <section className="max-w-intervee-page mx-auto px-4 py-8">
        <h2 className="text-intervee-primary mb-6 text-3xl font-bold uppercase">
          Ultimas Actualizaciones
        </h2>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <article className="bg-intervee-news overflow-hidden border-2 border-black text-white shadow-lg">
              <div className="h-intervee-news-height relative">
                <div className="bg-intervee-news-empty absolute inset-0" />
                <div className="absolute right-0 bottom-0 left-0 bg-black/50 p-6">
                  <h3 className="mb-2 text-3xl font-bold uppercase">
                    Intervee esta en beta
                  </h3>
                  <p className="mb-4 text-sm text-gray-400 italic">
                    1 may. 2024 | Actualizaciones
                  </p>
                  <p className="text-lg leading-snug">
                    Estamos construyendo el mundo virtual para practicar
                    entrevistas, conectar con oportunidades y mejorar tu perfil
                    profesional.
                  </p>
                </div>
              </div>
            </article>
          </div>

          <aside className="space-y-6">
            <InfoCard title="Consejos de Entrevista">
              <p className="text-sm font-bold">
                Ten en cuenta: cuidado con cualquier cosa.
              </p>
              <p className="text-xs text-blue-100">
                Intervee esta en beta. Revisa la informacion que compartes y usa
                el entorno con criterio mientras seguimos mejorandolo.
              </p>
            </InfoCard>

            <InfoCard title="Para Empresas">
              <p className="text-sm font-bold text-blue-200 italic">
                Buscas talento excepcional?
              </p>
              <p className="text-xs text-blue-100">
                Conoces las herramientas disponibles para que los reclutadores
                puedan encontrar a los mejores candidatos en Intervee?
              </p>
              <button
                className="border border-white/30 bg-white/10 px-3 py-1 text-xs font-bold uppercase opacity-60"
                disabled
                type="button"
              >
                Ver mas
              </button>
            </InfoCard>
          </aside>
        </div>
      </section>

      <footer className="mt-12 border-t border-gray-400 bg-gray-200 py-20">
        <div className="max-w-intervee-page mx-auto px-4 text-center">
          <div className="mb-6 flex flex-wrap justify-center gap-6">
            {["Privacidad", "Condiciones de Uso", "Atencion al Usuario"].map(
              (link) => (
                <span
                  className="text-intervee-muted-link text-xs font-bold uppercase hover:text-blue-600"
                  key={link}
                >
                  {link}
                </span>
              ),
            )}
          </div>
          <p className="mx-auto max-w-2xl text-[10px] text-gray-500">
            2024 Intervee Corp. Todos los derechos reservados. Intervee es una
            marca registrada. Este sitio es un entorno virtual para la practica
            de entrevistas y networking profesional.
          </p>
        </div>
      </footer>
    </main>
  );
}

function InfoCard({
  children,
  title,
}: Readonly<{ children: React.ReactNode; title: string }>) {
  return (
    <section className="bg-intervee-surface overflow-hidden border-2 border-black text-white shadow-md">
      <div className="bg-black/20 p-3">
        <h3 className="text-sm font-bold uppercase">{title}</h3>
      </div>
      <div className="space-y-3 p-4">{children}</div>
    </section>
  );
}
