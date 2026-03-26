export type OmniConfig = {
  name?: string;
  version?: string | number;
  date?: string;
  exportedAt?: string;
  includedKeys?: string[];
  values?: Record<string, unknown>;
  config?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  catalogs?: Array<{ id: string; [key: string]: unknown }>;
};

export type ConfigState = {
  originalConfig: OmniConfig | null;
  currentValues: Record<string, unknown>; // Parsed values (base64 decoded)
  disabledKeys: Set<string>; // Keys that have been toggled off
  catalogs: Array<Record<string, unknown>>; // Specifically extracted catalogs for easier management
  isLoaded: boolean;
  fileName: string;
};
