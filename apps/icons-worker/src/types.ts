export type IconVariant = "outline" | "filled";
export type IconSource = "builtin" | "mcp";

export type IconRecord = {
  name: string;
  component: string;
  category: string;
  tags: string[];
  variant: IconVariant;
  body: string;
  svg: string;
  jsx: string;
  source: IconSource;
  createdAt?: string;
  updatedAt?: string;
};

export type IconEvent = {
  id: number;
  action: "add" | "update" | "delete";
  iconName: string;
  component: string;
  category: string;
  createdAt: string;
};

export type CatalogStats = {
  total: number;
  mcpAdded: number;
  outline: number;
  filled: number;
  eventCount: number;
};

export type ActivityDay = {
  date: string;
  count: number;
};

export type IconInput = {
  name: string;
  component?: string;
  category?: string;
  tags?: string[] | string;
  variant?: IconVariant;
  svg?: string;
  body?: string;
};

export type D1Result<T = Record<string, unknown>> = {
  results: T[];
  success: boolean;
  meta?: Record<string, unknown>;
};

export type D1PreparedStatement = {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(colName?: string): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run<T = Record<string, unknown>>(): Promise<D1Result<T>>;
};

export type D1Database = {
  prepare(query: string): D1PreparedStatement;
};

export type AssetsFetcher = {
  fetch(request: Request): Promise<Response>;
};

export type Env = {
  ASSETS?: AssetsFetcher;
  ICONS_DB?: D1Database;
  ICON_MCP_WRITE_TOKEN?: string;
  ALLOWED_ORIGINS?: string;
  SITE_URL?: string;
};
