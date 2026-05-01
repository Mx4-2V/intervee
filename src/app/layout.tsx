import "~/styles/globals.css";

import { type Metadata } from "next";
import { Ubuntu } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "Intervee - Domina tus entrevistas en nuestro mundo virtual",
  description:
    "Practica entrevistas y networking profesional en el mundo virtual de Intervee.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const ubuntu = Ubuntu({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-ubuntu",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${ubuntu.variable}`}>
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
