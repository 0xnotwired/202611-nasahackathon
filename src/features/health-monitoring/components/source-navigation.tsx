"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

const Context = createContext<{
  pending: boolean;
  navigate: (href: string) => void;
} | null>(null);

export function SourceNavigation({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const previous = useRef(false);
  useEffect(() => {
    if (previous.current && !pending)
      document.getElementById("contenido")?.focus();
    previous.current = pending;
  }, [pending]);
  return (
    <Context
      value={{
        pending,
        navigate: (href) =>
          startTransition(() => router.push(href, { scroll: false })),
      }}
    >
      <span className="sr-only" role="status">
        {pending ? "Cambiando fuente de datos…" : "Vista de datos lista."}
      </span>
      {children}
    </Context>
  );
}

export function useSourceNavigation() {
  const value = useContext(Context);
  if (!value)
    throw new Error("La navegación de fuentes requiere su proveedor.");
  return value;
}

export function SourceContent({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const { pending } = useSourceNavigation();
  return (
    <main className={className} aria-busy={pending} inert={pending}>
      {children}
    </main>
  );
}
