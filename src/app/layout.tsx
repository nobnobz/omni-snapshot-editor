import { ConfigProvider } from "@/context/ConfigContext";
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
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-neutral-950 text-neutral-50 selection:bg-blue-500/30">
        <ConfigProvider>
          {children}
        </ConfigProvider>
      </body>
    </html>
  );
}
