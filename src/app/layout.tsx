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
      <body className="antialiased min-h-screen bg-background text-foreground selection:bg-blue-500/30">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ConfigProvider>
            {children}
          </ConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
