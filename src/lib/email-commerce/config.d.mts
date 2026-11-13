export function sealStore(config: unknown, secret: string | undefined): string;
export function openStore(token: unknown, secret: string | undefined): any;
export function validateOrder(products: any[], requested: unknown): { lines: any[]; currency: string; total: number };
