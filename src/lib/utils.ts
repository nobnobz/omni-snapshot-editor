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
  } catch (e) {
    // If not valid Mojibake or already correct, return as is
    return name;
  }
}

export function resolveCatalogName(id: string, customNames: Record<string, string> = {}): string {
  if (!id) return id;

  // 1. Custom Name from JSON
  const customName = customNames[id];
  if (customName && customName.trim() !== "" && customName !== id) {
    return formatDisplayName(customName);
  }

  // 2. Fallback from Metadata List
  const fallbackName = CATALOG_FALLBACKS[id];
  if (fallbackName) {
    return formatDisplayName(fallbackName);
  }

  // 3. Last resort: ID itself
  return id;
}
