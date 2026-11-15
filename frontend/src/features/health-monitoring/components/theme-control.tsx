"use client";

import { useEffect, useState } from "react";
import { Monitor } from "lucide-react";

type Theme = "system" | "light" | "dark";
const key = "orbita-theme-v1";

export function ThemeControl() {
  const [theme, setTheme] = useState<Theme>("system");
  useEffect(() => {
    const sync = () => {
      let value: string | null = null;
      try {
        value = localStorage.getItem(key);
      } catch {
        /* Sigue el sistema. */
      }
      const next = value === "light" || value === "dark" ? value : "system";
      setTheme(next);
      const meta = document.querySelector('meta[name="color-scheme"]');
      meta?.setAttribute("content", next === "system" ? "light dark" : next);
    };
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const change = (next: Theme) => {
    setTheme(next);
    document
      .querySelector('meta[name="color-scheme"]')
      ?.setAttribute("content", next === "system" ? "light dark" : next);
    try {
      if (next === "system") localStorage.removeItem(key);
      else localStorage.setItem(key, next);
    } catch {
      /* La preferencia sigue funcionando durante esta visita. */
    }
  };
  return (
    <label className="theme-control">
      <Monitor size={16} aria-hidden="true" />
      <span>Tema</span>
      <select
        aria-label="Tema"
        value={theme}
        onChange={(event) => change(event.target.value as Theme)}
      >
        <option value="system">Sistema</option>
        <option value="light">Claro</option>
        <option value="dark">Oscuro</option>
      </select>
    </label>
  );
}
