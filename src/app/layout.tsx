import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Monitoreo de salud | Órbita",
  description:
    "Prototipo de monitoreo de salud de astronautas con datos simulados.",
  icons: { icon: "/orbita.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <head>
        <meta
          name="color-scheme"
          content="light dark"
          suppressHydrationWarning
        />
        <script
          id="orbita-theme-init"
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('orbita-theme-v1');if(t==='light'||t==='dark')document.querySelector('meta[name="color-scheme"]').content=t}catch{}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <a href="#contenido" className="skip-link">
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
