import type { Metadata } from "next";
import "./globals.css";
import "../features/health-monitoring/components/aerobic.css";
import { SourceNavigation } from "../features/health-monitoring/components/source-navigation";

export const metadata: Metadata = {
  title: "Health monitoring | Órbita",
  description:
    "Prototype for monitoring astronaut health with simulated data.",
  icons: { icon: "/orbita.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <meta name="text-scale" content="scale" />
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
        <a href="#content" className="skip-link">
          Skip to content
        </a>
        <SourceNavigation>{children}</SourceNavigation>
      </body>
    </html>
  );
}
