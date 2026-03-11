import { ConfigProvider } from "@/context/ConfigContext";
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
    icon: "/omni-snapshot-editor/clown.png",
    apple: "/omni-snapshot-editor/clown.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "transparent" },
    { media: "(prefers-color-scheme: dark)", color: "transparent" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background text-foreground selection:bg-blue-500/30 overflow-x-hidden relative">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* Robust Global Background Stack */}
          <div 
            className="fixed inset-0 z-0 pointer-events-none overflow-hidden isolate"
            style={{
              paddingTop: 'env(safe-area-inset-top)',
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            {/* 1. Base solid background */}
            <div className="absolute inset-0 bg-background" />

            {/* 2. Grid pattern - extended even further for super-robust coverage */}
            <div 
              className="absolute inset-[-100px] opacity-[0.12] dark:opacity-[0.20]" 
              style={{ 
                backgroundImage: `linear-gradient(to right, oklch(0.60 0 0 / 0.2) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.60 0 0 / 0.2) 1px, transparent 1px)`,
                backgroundSize: '32px 32px'
              }} 
            />

            {/* 3. Decorative Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-500/10 dark:bg-blue-900/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '10s' }} />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 dark:bg-indigo-900/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '7s' }} />
            <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-emerald-500/5 dark:bg-emerald-900/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '12s' }} />
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
