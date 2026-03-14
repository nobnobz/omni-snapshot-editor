import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { CATALOG_FALLBACKS } from "./catalog-fallbacks"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDisplayName(name: string): string {
  if (!name) return name;
  try {
    // Fix for UTF-8 bytes misinterpreted as ISO-8859-1 (Mojibake)
    // Common cases: Michael „Bully“ Herbig, Timothée Chalamet
    return decodeURIComponent(escape(name));
  } catch {
    // If not valid Mojibake or already correct, return as is
    return name;
  }
}

export function resolveCatalogName(id: string, customNames: Record<string, string> = {}): string {
  if (!id) return id;

  // 1. Exact Custom Name from JSON
  const customName = customNames[id];
  if (customName && customName.trim() !== "" && customName !== id) {
    return formatDisplayName(customName);
  }

  // Helper to strip leading prefixes like "movie:", "series:"
  let baseId = id;
  if (id.includes(":")) {
    const parts = id.split(":");
    if (parts.length === 2 && ["movie", "series", "anime"].includes(parts[0])) {
      baseId = parts[1];
    } else if (!id.startsWith("movie:trakt-list") && !id.startsWith("series:trakt-list")) {
      baseId = parts.slice(1).join(":");
    }
  }

  // 1b. Fallback Custom Name (without prefix)
  const fallbackCustomName = customNames[baseId];
  if (fallbackCustomName && fallbackCustomName.trim() !== "" && fallbackCustomName !== baseId) {
    return formatDisplayName(fallbackCustomName);
  }

  // 2. Fallback from Metadata List (exact or base)
  const fallbackName = CATALOG_FALLBACKS[id] || CATALOG_FALLBACKS[baseId];
  if (fallbackName) {
    return formatDisplayName(fallbackName);
  }

  // 3. Last resort: ID itself
  return id;
}

/**
 * Ensures a catalog ID has the required "movie:" or "series:" prefix.
 * If already prefixed, returns as is.
 * If not, uses the displayName to guess the correct prefix.
 */
export function ensureCatalogPrefix(id: string, name?: string): string {
  if (!id || id.includes(':')) return id;

  const lowerName = (name || "").toLowerCase();
  let typePrefix = "movie:"; // default
  if (lowerName.includes("show") || lowerName.includes("series") || lowerName.includes("tv")) {
    typePrefix = "series:";
  }
  return `${typePrefix}${id}`;
}
export function isIos(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPhone|iPod|iPad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}
