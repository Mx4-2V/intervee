# DESIGN.md — Virtual World UI System

Documento de referencia del sistema de diseño visual del proyecto. Refleja la UI existente tal como está implementada.

---

## Filosofía de Diseño

- **Estética**: Web 2000s / Y2K — bordes angulares, negro de contorno, profundidad táctil.
- **Paleta**: Azules intensos como color de marca, negro como borde universal, verde para éxito.
- **Tipografía**: Ubuntu con labels en uppercase + letter-spacing ajustado.
- **Animaciones**: Mínimas e intencionales (spinner, pulse, slide-in, translate-y).
- **Responsive**: Mobile-first con breakpoints `sm`, `md`, `lg`, `xl`.

---

## Colores

Todos los colores están definidos como variables CSS en `src/styles/globals.css` dentro del bloque `@theme`, y se usan como clases Tailwind con el prefijo `intervee-*`.

### Fondos y superficies

| Token                   | Valor                         | Uso                              |
|------------------------|-------------------------------|----------------------------------|
| `intervee-page`        | `#f3f3f3`                     | Fondo general de página          |
| `intervee-page-soft`   | `#eefbff`                     | Fondo suave alternativo          |
| `intervee-surface`     | `#004a7c`                     | Superficie principal (azul oscuro)|
| `intervee-surface-dark`| `#242424`                     | Superficie oscura / charcoal     |
| `intervee-shell`       | `#f4f2f0`                     | Fondo beige claro                |
| `intervee-shell-dark`  | `#2a2d2e`                     | Fondo beige oscuro               |
| `intervee-card`        | `rgba(255,255,255,0.78)`      | Card semi-transparente           |
| `intervee-card-strong` | `#ffffff`                     | Card blanca sólida               |
| `intervee-ghost`       | `#f3f4f6`                     | Fondo ghost (muy claro)          |
| `intervee-input`       | `#d9d9d9`                     | Fondo de inputs                  |

### Gradientes del Hero

| Token                    | Valor      |
|--------------------------|------------|
| `intervee-hero-from`     | `#005d97`  |
| `intervee-hero-to`       | `#00426d`  |

### Colores de acción

| Token                       | Valor      | Uso                         |
|-----------------------------|------------|-----------------------------|
| `intervee-action`           | `#008140`  | Éxito / confirmación        |
| `intervee-connect`          | `#0070c0`  | CTA primario / links        |
| `intervee-connect-hover`    | `#0088e0`  | Hover del CTA               |
| `intervee-google`           | `#4285f4`  | Botón de Google             |
| `intervee-news`             | `#242424`  | Fondo de sección noticias   |
| `intervee-news-empty`       | `#1b1b1b`  | Noticias vacías             |
| `intervee-primary`          | `#004a7c`  | Color primario de marca     |

### Bordes y texto

| Token                      | Valor                        | Uso                         |
|----------------------------|------------------------------|-----------------------------|
| `intervee-border`          | `#000000`                    | Borde universal (negro)     |
| `intervee-card-border`     | `rgba(255,255,255,0.3)`      | Borde de cards claras       |
| `intervee-soft-border`     | `rgba(229,231,235,0.9)`      | Borde suave                 |
| `intervee-ink`             | `#111827`                    | Texto oscuro principal      |
| `intervee-muted`           | `#6b7280`                    | Texto apagado               |
| `intervee-text-soft`       | `#d9ecff`                    | Texto sobre superficies azules|
| `intervee-muted-link`      | `#4b5563`                    | Links secundarios           |

### Overlays

| Token                      | Valor                    |
|----------------------------|--------------------------|
| `intervee-stage-overlay`   | `rgba(255,255,255,0.2)`  |

---

## Tipografía

- **Fuente**: Ubuntu (Google Fonts, cargada con `next/font`)
- **Pesos**: 400 (regular), 700 (bold)
- **Clase base**: `font-sans`

### Escala de tamaños

| Uso                  | Clase Tailwind          |
|----------------------|-------------------------|
| Micro / tracking     | `text-[0.65rem]` – `text-xs` |
| Body pequeño         | `text-sm`               |
| Body estándar        | `text-base`             |
| Subtítulos           | `text-lg` – `text-xl`  |
| Títulos de sección   | `text-2xl` – `text-3xl`|
| Títulos de página    | `text-4xl`              |

### Convenciones

- Labels de UI: `uppercase tracking-[0.14em–0.2em] font-semibold text-xs`
- Botones: `uppercase font-semibold`
- Headings: `font-bold`
- Énfasis secundario: `font-medium`

---

## Componentes

### Botones

**Primario (Connect)**
```
bg-intervee-connect hover:bg-intervee-connect-hover
border-b-4 border-blue-900
px-6 py-3 uppercase font-semibold
active:translate-y-1 transition
```
Genera efecto "presionado" gracias al `border-b-4`.

**Secundario (Ghost)**
```
border border-white/20 bg-white/10
px-6 py-3 uppercase font-semibold
hover:bg-white/15 transition
```

**Deshabilitado**
```
disabled:cursor-not-allowed disabled:opacity-60
```

---

### Cards / Paneles

**Panel estándar** (sobre fondos oscuros)
```
border-2 border-intervee-border
bg-intervee-surface text-white
shadow-intervee-panel p-4–p-6
```

**Card info con header**
```
bg-intervee-surface border-2 border-intervee-border
header: bg-black/20 px-4 py-2 font-semibold uppercase
```

**Card resultado** (entrevista)
```
rounded-2xl border-2 bg-white/95
```

---

### Inputs y Textareas

```
border-2 border-intervee-border focus:border-intervee-connect
bg-intervee-page text-gray-900
px-4 py-2–py-4
placeholder:text-gray-400
```

Textarea:
```
min-h-40 resize-none
```

---

### Status Pills

```
rounded-full border px-3 py-1
text-xs font-semibold tracking-[0.16em] uppercase
```

| Variante   | Clases de color                                         |
|------------|--------------------------------------------------------|
| Éxito      | `border-intervee-border bg-intervee-action text-white` |
| Peligro    | `border-intervee-border bg-intervee-news text-white`   |
| Neutro     | `border-intervee-border bg-intervee-page-soft text-intervee-primary` |

---

### Loaders / Pantallas de transición

**Loader de entrevista / salida**
```
fixed inset-0 z-50 flex flex-col items-center justify-center
bg-[#004a77]
spinner: border-4 border-white/20 border-t-white animate-spin rounded-full
texto: text-2xl font-bold animate-pulse text-white
```

**Teleport screen**
```
fixed inset-0 z-50 bg-gray-950
spinner + texto animado centrado
```

---

### Navegación / Header (páginas de entrevista)

```
sticky top-0 z-40
bg-gradient (hero-from → hero-to) border-b-2 border-intervee-border
shadow-xl py-4
```

Contenido: logo izquierda, info central, botón salida derecha (todo en blanco).

---

## Layout y Espaciado

### Variables de espaciado

| Token                       | Valor         | Uso                         |
|-----------------------------|---------------|-----------------------------|
| `max-w-intervee-page`       | `80rem`       | Ancho máximo de contenido   |
| `w-intervee-login`          | `28.125rem`   | Ancho del card de login     |
| `h-intervee-news-height`    | `25rem`       | Altura de la sección noticias|
| `w-intervee-sidebar`        | `20rem`       | Ancho del sidebar           |

### Border Radius

- **Por defecto**: sin redondeo (bordes rectos).
- `rounded-full`: pills, spinners, avatares circulares.
- `rounded-2xl`: cards de resultados (entrevista).
- `rounded`: solo para elementos circulares pequeños.

### Sombras

| Token                    | Valor                                                                                         |
|--------------------------|-----------------------------------------------------------------------------------------------|
| `shadow-intervee-logo`   | `3px 3px 0 rgb(0 0 0 / 0.9)` — sombra dura tipo retro                                       |
| `shadow-intervee-panel`  | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`                       |
| `shadow-intervee-glass`  | `0 20px 60px -24px rgb(15 23 42 / 0.35), 0 10px 24px -16px rgb(15 23 42 / 0.22)`            |

---

## Páginas clave

### `/` — Home / Lobby

- Hero de ancho completo con gradiente azul.
- Formulario de login en card a la derecha con `shadow-intervee-panel`.
- Sección de noticias: grid `1 col (mobile) / 3 col (desktop)`.
- Artículo destacado (2 cols) + sidebar de cards (1 col).
- Footer: `border-t bg-gray-200` con texto pequeño y muted.

### `/game` — Mundo 3D

- Full-screen: `h-screen w-screen overflow-hidden`.
- Canvas React Three Fiber.
- Overlay coordenadas (top-left): `border bg-black/65 px-3 py-2 font-mono`.
- Panel portal activo (top-right): `border-2 animate-in fade-in slide-in-from-right-4`.

### `/editor` — Editor de mundo

- Full-screen con cámara ortográfica.
- Panel izquierdo (`19rem`): grilla de assets 2 columnas, botones `bg-black border-white`.
- Panel derecho (`19rem`): inputs de coordenadas (X/Y/Z), dropdowns, color picker, botones de acción.
- Overflow: `max-h-[calc(100vh-2rem)] overflow-y-auto`.

### `/companies/:slug/interview` — Entrevista

- Header sticky con gradiente.
- **Intro**: card `intervee-surface`, info en grilla 3 cols, CTA al fondo.
- **Entrevista**: layout `1fr + 22rem sidebar`, textarea de respuesta, barra de progreso animada.
- **Resultados**: score grande, pills de estado, cards `rounded-2xl`, revisión de preguntas.

---

## Stack Técnico

| Área            | Tecnología                              |
|-----------------|-----------------------------------------|
| Framework       | Next.js 15 / React 19                   |
| Estilos         | Tailwind CSS 4.0 + PostCSS              |
| Fuentes         | `next/font` (Google Fonts — Ubuntu)     |
| 3D              | React Three Fiber + Three.js + Drei     |
| Estado global   | Zustand (editor), React hooks (entrevista) |

---

> Este documento se mantiene manualmente. Si modificás variables de color, componentes o layouts, actualizá este archivo para mantenerlo como fuente de verdad del sistema de diseño.
