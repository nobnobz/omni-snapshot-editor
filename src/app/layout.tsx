import { ConfigProvider } from "@/context/ConfigContext";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata = {
  title: "Omni Config Editor",
  description: "A client-side JSON editor for Omni configs",
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
