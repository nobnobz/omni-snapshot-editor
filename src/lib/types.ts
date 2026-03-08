export type OmniConfig = {
  name?: string;
  version?: string | number;
  date?: string;
  exportedAt?: string;
  includedKeys?: string[];
  values?: Record<string, any>;
  config?: Record<string, any>;
  metadata?: any;
};

export type ConfigState = {
  originalConfig: OmniConfig | null;
  currentValues: Record<string, any>; // Parsed values (base64 decoded)
  disabledKeys: Set<string>; // Keys that have been toggled off
  catalogs: any[]; // Specifically extracted catalogs for easier management
  isLoaded: boolean;
  fileName: string;
};
