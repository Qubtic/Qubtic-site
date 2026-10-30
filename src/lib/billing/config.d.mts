export interface CatalogConfiguration { plugin_slug: string; cadence: 'monthly' | 'yearly' | 'lifetime'; product_id: string; benefit_id: string; environment: string; enabled: boolean }
type Environment = Record<string, string | undefined>;
export const CADENCES: string[];
export const PLUGINS: { slug: string; prefix: string }[];
export const REQUIRED_SCOPES: string[];
export function billingSiteUrl(env: Environment): string;
export function configuredCatalog(env: Environment): CatalogConfiguration[];
export function configurationProblems(env: Environment): string[];
export function catalogMatches(actual: CatalogConfiguration[], desired: CatalogConfiguration[]): boolean;
