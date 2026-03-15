import { ConfigProvider } from "@/context/ConfigContext";
import { ThemeChromeSync } from "@/components/theme-chrome-sync";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata = {
  title: "Omni Config Editor",
  description: "A client-side JSON editor for Omni configs",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Omni Editor",
  },
  manifest: "/omni-snapshot-editor/manifest.json",
  icons: {
    icon: [
      { url: "/omni-snapshot-editor/favicon-transparent.svg?v=4", type: "image/svg+xml" },
      { url: "/omni-snapshot-editor/favicon-transparent-32.png?v=4", sizes: "32x32", type: "image/png" },
      { url: "/omni-snapshot-editor/favicon-transparent-64.png?v=4", sizes: "64x64", type: "image/png" },
      { url: "/omni-snapshot-editor/omni-icon-dark-192.png", sizes: "192x192", type: "image/png" },
      { url: "/omni-snapshot-editor/omni-icon-dark-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/omni-snapshot-editor/apple-touch-icon-dark.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/omni-snapshot-editor/favicon-transparent.svg?v=4",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f8f8" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/omni-snapshot-editor/apple-touch-icon-dark.png" />
        <link rel="apple-touch-icon" href="/omni-snapshot-editor/apple-touch-icon-light.png" media="(prefers-color-scheme: light)" />
        <link rel="apple-touch-icon" href="/omni-snapshot-editor/apple-touch-icon-dark.png" media="(prefers-color-scheme: dark)" />
      </head>
      <body className="antialiased min-h-screen text-foreground selection:bg-primary/30 overflow-x-hidden relative">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeChromeSync />
          {/* Robust Global Background Stack */}
          <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden isolate">
            {/* 1. Base solid background */}
            <div className="absolute inset-0 bg-background" />

            {/* 2. Grid pattern - extended even further for super-robust coverage */}
            <div
              className="absolute inset-[-100px] opacity-[0.11] dark:opacity-[0.095]"
              style={{
                backgroundImage: `linear-gradient(to right, oklch(0.60 0 0 / 0.15) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.60 0 0 / 0.15) 1px, transparent 1px)`,
                backgroundSize: "32px 32px"
              }}
            />

            {/* 3. Decorative Blobs */}
            <div
              className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] animate-pulse"
              style={{ animationDuration: "10s", backgroundColor: "var(--page-blob-info)" }}
            />
            <div
              className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] animate-pulse"
              style={{ animationDuration: "7s", backgroundColor: "var(--page-blob-warning)" }}
            />
            <div
              className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full blur-[100px] animate-pulse"
              style={{ animationDuration: "12s", backgroundColor: "var(--page-blob-success)" }}
            />
          </div>

          <div className="relative z-10 flex flex-col min-h-screen">
            <ConfigProvider>
              {children}
            </ConfigProvider>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
