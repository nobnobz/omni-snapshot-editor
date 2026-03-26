export type CatalogType = "movie" | "series" | "all" | "anime";

export interface CatalogFallback {
  name: string;
  type: CatalogType;
}

// Intentionally empty: catalog metadata should come from imported AIOMetadata data only.
export const CATALOG_FALLBACKS: Record<string, CatalogFallback> = {};
