"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global app error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <div className="w-full max-w-xl rounded-3xl border border-border bg-card/70 p-8 text-center shadow-xl backdrop-blur">
          <h1 className="text-2xl font-black tracking-tight">Something went wrong</h1>
          <p className="mt-3 text-sm text-foreground/65">
            The app hit an unexpected error. You can retry the current render without losing the whole browser session.
          </p>
          <div className="mt-6 flex justify-center">
            <Button onClick={reset} className="font-semibold">
              Try again
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
