import { ConfigProvider } from "@/context/ConfigContext";
import { ThemeChromeSync } from "@/components/theme-chrome-sync";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata = {
  title: "Omni Snapshot Manager",
  description: "A client-side editor for Omni snapshots",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Omni Snapshot Manager",
  },
  manifest: "/omni-snapshot-editor/manifest.json",
  icons: {
    icon: [
      { url: "/omni-snapshot-editor/favicon-v3.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/omni-snapshot-editor/icon-16-v3.png", sizes: "16x16", type: "image/png" },
      { url: "/omni-snapshot-editor/icon-32-v3.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/omni-snapshot-editor/pwa-ios-icon-180.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/omni-snapshot-editor/favicon-v3.ico",
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
