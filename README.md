# Intervee

Plataforma de preparacion de entrevistas con un mundo virtual 3D donde los usuarios exploran una ciudad y entran a portales de empresas para realizar entrevistas simuladas con inteligencia artificial.

## Descripcion

Intervee combina un entorno 3D interactivo construido con React Three Fiber y fisica Rapier con un sistema de entrevistas impulsado por IA. El usuario camina por una ciudad virtual, descubre portales luminosos que representan empresas reales, y al entrar es teletransportado a una experiencia 2D de entrevista donde un reclutador AI evalua sus respuestas en tiempo real.

El flujo completo: landing page con informacion del proyecto, exploracion del mundo 3D en primera persona, deteccion de portales por proximidad, transicion a entrevista 2D con generacion de preguntas y evaluacion personalizada, y resultados detallados con puntuacion y retroalimentacion.

## Stack tecnologico

| Categoria | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| 3D | Three.js, React Three Fiber, @react-three/drei, @react-three/rapier |
| IA | Vercel AI SDK (Google, OpenAI, Anthropic, Groq, OpenAI-compatible) |
| API | tRPC v11, API Routes |
| Base de datos | Prisma ORM con SQLite |
| Autenticacion | NextAuth v5 (Discord) |
| Validacion | Zod, @t3-oss/env-nextjs |
| Estado | Zustand |

## Funcionalidades

- **Mundo 3D explorable** — Ciudad con edificios, calles, bancos, semaforos, autos y otros assets urbanos. Movimiento en primera persona con WASD/flechas y salto.
- **Portales de empresas** — Circulos luminosos animados con el logo de la empresa. Al acercarse se activa la opcion de entrar a la entrevista.
- **Entrevistas con IA** — Generacion de preguntas adaptadas a cada empresa, evaluacion de respuestas con puntuacion detallada, senales de contratacion, riesgos y retroalimentacion por pregunta.
- **Multi-provider AI** — Soporte para Google Gemini, OpenAI, Anthropic, Groq, Vercel AI Gateway y cualquier proveedor compatible con la API de OpenAI.
- **Editor de mundo** — Editor 3D visual para agregar, mover, rotar y eliminar assets del mundo. Panel lateral con selector de assets y propiedades editables. Auto-guardado con debounce.
- **Sistema de diseño Intervee** — Paleta de colores propia, tokens de sombra, tipografia Ubuntu.

## Inicio rapido

### Prerrequisitos

- Node.js 18+
- npm 11+
- Una clave de API de algun proveedor de IA (Google Gemini, OpenAI, Anthropic o Groq)

### Instalacion

```bash
git clone <url-del-repo>
cd virtual-world
npm install
```

### Configuracion

1. Copiar el archivo de ejemplo:

```bash
cp .env.example .env
```

2. Completar las variables en `.env`. Las minimas necesarias para arrancar:

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="genera-un-secreto-con-npx-auth-secret"
AUTH_GOOGLE_ID="google-client-id"
AUTH_GOOGLE_SECRET="google-client-secret"
GOOGLE_AI_API_KEY="tu-api-key"
```

3. Inicializar la base de datos:

```bash
npm run db:push
```

4. Iniciar el servidor de desarrollo:

```bash
npm run dev
```

La aplicacion estara disponible en `http://localhost:3000`.

## Estructura del proyecto

```
src/
  app/                          # Next.js App Router
    page.tsx                    # Landing page (HomeScreen)
    game/page.tsx               # Mundo 3D principal
    editor/page.tsx             # Editor visual del mundo
    companies/[companySlug]/
      interview/page.tsx        # Experiencia de entrevista AI
    api/
      world-layout/route.ts     # GET/POST layout del mundo (JSON)
      companies/[companySlug]/
        questions/route.ts      # Generacion de preguntas
        evaluate/route.ts       # Evaluacion de respuestas
  components/
    world/                      # Componentes 3D (escena, jugador, portales, editor)
    interview/                  # Componentes de entrevista 2D
  data/
    world-layout.json           # Layout persistente del mundo
  lib/
    world-layout.ts             # Definiciones de assets y schemas Zod
    company-interviews.ts       # Perfiles de empresas y contexto
    interview-ai.ts             # Generacion de preguntas y evaluacion
    interview-schema.ts         # Schemas de validacion
  server/
    auth/                       # Configuracion NextAuth
    api/                        # tRPC routers
    db.ts                       # Cliente Prisma singleton
  hooks/                       # Custom React hooks
  styles/
    globals.css                 # Tailwind v4 + design tokens Intervee
```

## Arquitectura

La aplicacion opera en dos modos de renderizado:

1. **Modo 3D (React Three Fiber)** — El juego principal y el editor comparten componentes de entorno, iluminacion y assets. El juego usa fisica Rapier con colisiones y deteccion de proximidad a portales. El editor usa OrbitControls y permite edicion directa sin fisica.

2. **Modo 2D (React estandar)** — Las entrevistas se ejecutan como paginas regulares de Next.js con flujo de tres fases: introduccion, preguntas y respuestas, resultados con evaluacion.

La transicion entre modos ocurre cuando el jugador se acerca a un portal en el mundo 3D y selecciona entrar, lo cual navega via `router.push()` a la pagina de entrevista correspondiente.

El layout del mundo se persiste como un archivo JSON (`src/data/world-layout.json`) que se modifica desde el editor y se sirve via API. No hay persistencia en base de datos para el layout.

## Scripts

| Script | Descripcion |
|---|---|
| `npm run dev` | Servidor de desarrollo con Turbopack |
| `npm run build` | Build de produccion |
| `npm run start` | Servidor de produccion |
| `npm run preview` | Build + start de produccion |
| `npm run lint` | Linting con ESLint |
| `npm run lint:fix` | Linting con auto-fix |
| `npm run typecheck` | Verificacion de tipos TypeScript |
| `npm run check` | Lint + typecheck |
| `npm run format:check` | Verificar formato con Prettier |
| `npm run format:write` | Formatear con Prettier |
| `npm run db:generate` | Crear migracion de Prisma |
| `npm run db:migrate` | Aplicar migraciones |
| `npm run db:push` | Push del schema a la base de datos |
| `npm run db:studio` | Abrir Prisma Studio |

## Rutas

| Ruta | Descripcion |
|---|---|
| `/` | Landing page con informacion del proyecto |
| `/game` | Mundo 3D interactivo |
| `/editor` | Editor visual del mundo |
| `/companies/[slug]/interview` | Entrevista AI para la empresa |

## API

| Endpoint | Metodo | Descripcion |
|---|---|---|
| `/api/world-layout` | GET | Obtener layout del mundo |
| `/api/world-layout` | POST | Guardar layout del mundo |
| `/api/companies/[slug]/questions` | POST | Generar preguntas de entrevista |
| `/api/companies/[slug]/evaluate` | POST | Evaluar respuestas de entrevista |

tRPC expone procedimientos internos en `/api/trpc/[trpc]` pero las operaciones principales del dominio usan API Routes directamente.

## Sistema de entrevistas AI

### Generacion de preguntas

Se envia el slug de la empresa al endpoint `/api/companies/[slug]/questions`. El sistema busca el perfil de la empresa, construye un prompt con el documento de contratacion y genera entre 3 y 8 preguntas usando el proveedor de IA configurado. Si el proveedor falla, se usan preguntas de respaldo predefinidas.

### Evaluacion

Se envian las preguntas y respuestas al endpoint `/api/companies/[slug]/evaluate`. El sistema las procesa junto con el documento de contratacion y devuelve:
- Puntuacion por pregunta (0-100)
- Retroalimentacion detallada
- Senales de contratacion
- Riesgos identificados
- Puntuacion general y resultado (apto/no_apto segun el umbral configurado)

### Proveedores soportados

El provider/model/base URL/temperatura/tokens se configura desde `/admin/settings/llm`.
El `.env` solo guarda secretos de proveedores:

| Proveedor | Valor | API key requerida |
|---|---|---|
| Google Gemini | `google` | `GOOGLE_AI_API_KEY` |
| OpenAI | `openai` | `OPENAI_AI_API_KEY` |
| Anthropic | `anthropic` | `ANTHROPIC_AI_API_KEY` |
| Groq | `groq` | `GROQ_AI_API_KEY` |
| Vercel AI Gateway | `gateway` | `AI_GATEWAY_API_KEY` |
| OpenAI-compatible | `openai-compatible` | `OPENAI_COMPATIBLE_AI_API_KEY` |

## Editor de mundo

El editor en `/editor` permite:
- Seleccionar assets del catalogo (edificios, calles, props, portales, carteles)
- Colocar assets en el mundo haciendo clic en el suelo
- Mover, rotar y eliminar assets existentes
- Editar propiedades de portales de empresas y carteles
- Auto-guardado con debounce via `POST /api/world-layout`

Los assets disponibles se definen en `src/lib/world-layout.ts` con categorias de edificios, calles y props. Los modelos 3D estan en formato `.glb` en `public/assets/city-glb/`.

## Variables de entorno

| Variable | Tipo | Default | Descripcion |
|---|---|---|---|
| `DATABASE_URL` | `url` | — | URL de conexion a la base de datos |
| `AUTH_SECRET` | `string` | — | Secreto de NextAuth (requerido en produccion) |
| `AUTH_GOOGLE_ID` | `string` | — | Client ID de Google OAuth |
| `AUTH_GOOGLE_SECRET` | `string` | — | Client secret de Google OAuth |
| `GOOGLE_AI_API_KEY` | `string` | — | API key de Google AI |
| `OPENAI_AI_API_KEY` | `string` | — | API key de OpenAI |
| `ANTHROPIC_AI_API_KEY` | `string` | — | API key de Anthropic |
| `GROQ_AI_API_KEY` | `string` | — | API key de Groq |
| `OPENAI_COMPATIBLE_AI_API_KEY` | `string` | — | API key de proveedor OpenAI-compatible |
| `AI_GATEWAY_API_KEY` | `string` | — | API key de Vercel AI Gateway |
| `NODE_ENV` | `enum` | `development` | Modo de ejecucion |

## Despliegue

Para desplegar en Vercel, Netlify o Docker se pueden seguir las guias del stack T3:

- [Vercel](https://create.t3.gg/en/deployment/vercel)
- [Netlify](https://create.t3.gg/en/deployment/netlify)
- [Docker](https://create.t3.gg/en/deployment/docker)

Recordar configurar todas las variables de entorno en la plataforma de despliegue.
