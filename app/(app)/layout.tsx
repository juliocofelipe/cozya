import type { ReactNode } from "react";

export const metadata = {
  title: "Cozya",
  description: "Organize receitas rápidas com importação inteligente"
};

export default function AppLayout({ children }: { children: ReactNode }) {
  return children;
}
