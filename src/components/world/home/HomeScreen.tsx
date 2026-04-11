import Link from "next/link";

export function HomeScreen() {
  return (
    <main className="min-h-screen bg-[#050816] px-6 py-12 text-white">
      <div className="mx-auto flex min-h-[80vh] max-w-5xl flex-col justify-center gap-10">
        <div className="space-y-4">
          <p className="text-sm tracking-[0.35em] text-cyan-200 uppercase">
            Virtual World
          </p>
          <h1 className="max-w-3xl text-4xl leading-tight font-semibold sm:text-6xl">
            Mundo jugable y editor modular sobre la misma ciudad.
          </h1>
          <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
            Usa el editor para colocar assets y guardar el layout. Entra al modo
            juego para recorrer exactamente ese mismo mundo.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            className="rounded-2xl border border-cyan-300/30 bg-cyan-300 px-6 py-6 text-slate-950 transition hover:bg-cyan-200"
            href="/game"
          >
            <div className="text-sm tracking-[0.2em] uppercase">Juego</div>
            <div className="mt-2 text-2xl font-semibold">Entrar al mundo</div>
            <p className="mt-3 text-sm text-slate-700">
              Cámara isométrica, personaje jugable y colisiones activas.
            </p>
          </Link>

          <Link
            className="rounded-2xl border border-white/10 bg-white/5 px-6 py-6 transition hover:bg-white/10"
            href="/editor"
          >
            <div className="text-sm tracking-[0.2em] text-cyan-200 uppercase">
              Editor
            </div>
            <div className="mt-2 text-2xl font-semibold">Editar ciudad</div>
            <p className="mt-3 text-sm text-slate-300">
              Coloca assets, rota, duplica y guarda el JSON del mundo.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
