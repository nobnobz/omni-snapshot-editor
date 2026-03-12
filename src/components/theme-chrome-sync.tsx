"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

const CHROME_THEME_COLORS = {
  light: "#f8f8f8",
  dark: "#121212",
} as const;

export function ThemeChromeSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const activeTheme = resolvedTheme === "light" ? "light" : "dark";
    const themeColor = CHROME_THEME_COLORS[activeTheme];

    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!(themeColorMeta instanceof HTMLMetaElement)) {
      themeColorMeta = document.createElement("meta");
      themeColorMeta.setAttribute("name", "theme-color");
      document.head.appendChild(themeColorMeta);
    }

    themeColorMeta.setAttribute("content", themeColor);
    document.documentElement.style.colorScheme = activeTheme;
  }, [resolvedTheme]);

  return null;
}
