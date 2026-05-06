import Link from "next/link";

import { PageShell } from "~/components/ui";

export default function PrivacyPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-intervee-primary mb-8 text-3xl font-bold uppercase">
          Politica de Privacidad
        </h1>
        <p className="mb-4 text-sm text-intervee-text-muted">
          Ultima actualizacion: {new Date().getFullYear()}
        </p>

        <section className="space-y-6 text-sm text-intervee-ink leading-relaxed">
          <div>
            <h2 className="mb-2 text-lg font-bold">1. Informacion que recopilamos</h2>
            <p>
              En Intervee recopilamos informacion que proporcionas directamente,
              como tu nombre, correo electronico y perfil profesional, asi como
              datos generados automaticamente al usar la plataforma, como
              actividad de sesion y preferencias.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-bold">2. Como usamos tu informacion</h2>
            <p>
              Utilizamos tu informacion para proporcionar y mejorar los
              servicios de Intervee, personalizar tu experiencia, enviar
              comunicaciones relevantes y garantizar la seguridad de la
              plataforma.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-bold">3. Compartir informacion</h2>
            <p>
              No vendemos tu informacion personal. Podemos compartir datos
              agregados y anonimizados con fines analiticos. Solo compartimos
              informacion personal cuando es necesario para operar la plataforma
              o por requerimiento legal.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-bold">4. Seguridad de datos</h2>
            <p>
              Implementamos medidas de seguridad tecnicas y organizacionales
              para proteger tus datos contra accesos no autorizados, perdida o
              alteracion.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-bold">5. Tus derechos</h2>
            <p>
              Tienes derecho a acceder, corregir, eliminar y portar tus datos
              personales. Para ejercer estos derechos, contactanos a traves de
              nuestro canal de atencion al usuario.
            </p>
          </div>
        </section>

        <div className="mt-12 border-t border-intervee-soft-border pt-6">
          <Link
            href="/"
            className="text-intervee-connect text-sm font-bold uppercase hover:underline"
          >
            &larr; Volver al inicio
          </Link>
        </div>
      </div>
    </PageShell>
  );
}