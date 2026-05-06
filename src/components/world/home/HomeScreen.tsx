"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "~/components/ui";
import { Input } from "~/components/ui";
import { PageShell } from "~/components/ui";
import { PanelCard } from "~/components/ui";
import { SectionLabel } from "~/components/ui";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="mr-2 h-5 w-5">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function HomeScreen() {
  return (
    <PageShell>
      <section
        className="from-intervee-hero-from to-intervee-hero-to relative min-h-[31.25rem] overflow-hidden bg-linear-to-b pb-8 text-white"
        id="hero"
      >
        <nav className="relative z-20 border-b border-intervee-card-border bg-intervee-news/50 shadow-xl backdrop-blur-sm">
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

            <Button
              className="justify-self-center md:justify-self-end md:text-base"
              disabled
              size="sm"
              type="button"
              variant="primary"
              aria-label="Unete gratis proximamente"
            >
              Unete gratis
            </Button>
          </div>
        </nav>

        <div className="max-w-intervee-page relative z-10 mx-auto mt-8 flex flex-col items-center justify-between gap-8 px-4 md:flex-row">
          <section
            aria-label="Login desactivado"
            className="shadow-intervee-panel md:w-intervee-login ml-auto w-full rounded bg-intervee-news/50 p-6"
          >
            <div className="grid grid-cols-1 gap-6">
              <div>
                <p className="mb-2 text-center text-sm text-intervee-text-soft">
                  Inicia sesion con Google
                </p>
                <button
                  className="bg-intervee-google flex w-full cursor-not-allowed items-center justify-center rounded border-b-2 border-intervee-border/30 px-4 py-2 text-sm font-bold uppercase opacity-55"
                  disabled
                  type="button"
                >
                  <GoogleIcon />
                  Google
                </button>
              </div>

              <div>
                <p className="mb-2 text-center text-sm text-intervee-text-soft">
                  O utiliza tu email y contrasena
                </p>
                <fieldset className="space-y-2">
                  <Input disabled placeholder="Email" type="email" variant="login" />
                  <Input disabled placeholder="Contrasena" type="password" variant="login" />
                  <Link
                    className="bg-intervee-connect hover:bg-intervee-connect-hover block w-full border-b-4 border-intervee-hero-to py-3 text-center font-bold text-white uppercase transition active:translate-y-1"
                    href="/game"
                  >
                    Conectar
                  </Link>
                </fieldset>
                <p className="mt-2 text-center text-xs text-intervee-text-muted underline">
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
            <Link
              href="https://github.com/Mx4-2V/intervee"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <article className="bg-intervee-news overflow-hidden border-2 border-intervee-border text-white shadow-lg transition hover:brightness-110">
                <div className="relative h-intervee-news-height">
                  <Image
                    src="/assets/ads/github.png"
                    alt="Intervee en GitHub"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute right-0 bottom-0 left-0 bg-intervee-news/70 p-6 backdrop-blur-sm">
                    <h3 className="mb-2 text-3xl font-bold uppercase">
                      Estate atento a las novedades
                    </h3>
                    <p className="text-lg leading-snug">
                      Sigue el desarrollo de Intervee en GitHub y enterate de
                      todas las actualizaciones y nuevas funcionalidades.
                    </p>
                  </div>
                </div>
              </article>
            </Link>
          </div>

          <aside className="space-y-6">
            <InfoCard title="Consejos de Entrevista">
              <p className="text-sm font-bold">
                Ten en cuenta: cuidado con cualquier cosa.
              </p>
              <p className="text-xs text-intervee-text-soft">
                Intervee esta en beta. Revisa la informacion que compartes y usa
                el entorno con criterio mientras seguimos mejorandolo.
              </p>
            </InfoCard>

            <InfoCard title="Para Empresas">
              <p className="text-sm font-bold text-intervee-text-soft italic">
                Buscas talento excepcional?
              </p>
              <p className="text-xs text-intervee-text-soft">
                Conoces las herramientas disponibles para que los reclutadores
                puedan encontrar a los mejores candidatos en Intervee?
              </p>
              <Button
                className="opacity-60"
                disabled
                size="sm"
                type="button"
                variant="secondary"
              >
                Ver mas
              </Button>
            </InfoCard>
          </aside>
        </div>
      </section>

      <footer className="mt-12 border-t border-intervee-soft-border bg-intervee-ghost py-20">
        <div className="max-w-intervee-page mx-auto px-4 text-center">
          <div className="mb-6 flex flex-wrap justify-center gap-6">
            <Link
              className="text-intervee-muted-link text-xs font-bold uppercase hover:text-intervee-connect"
              href="/privacy"
            >
              Privacidad
            </Link>
          </div>
          <p className="mx-auto max-w-2xl text-[10px] text-intervee-text-muted">
            &copy; {new Date().getFullYear()} Intervee. Todos los derechos
            reservados. Intervee es una marca registrada. Este sitio es un
            entorno virtual para la practica de entrevistas.
          </p>
        </div>
      </footer>
    </PageShell>
  );
}

function InfoCard({
  children,
  title,
}: Readonly<{ children: React.ReactNode; title: string }>) {
  return (
    <PanelCard overflow padding="sm">
      <div className="bg-intervee-news/20 p-3">
        <SectionLabel tracking="normal">{title}</SectionLabel>
      </div>
      <div className="space-y-3">{children}</div>
    </PanelCard>
  );
}