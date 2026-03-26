import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "./components/service-worker-register";

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex"
});

export const metadata: Metadata = {
  title: "Cozya",
  description: "PWA minimalista para lembrar receitas rápidas",
  manifest: "/manifest.json",
  applicationName: "Cozya"
};

export const viewport = {
  themeColor: "#FAF8F4"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={plex.variable}>
      <head />
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
