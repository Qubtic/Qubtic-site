export function encryptSecrets(value: Record<string,string>, key: string | undefined, context: string): string;
export function decryptSecrets(value: string, key: string | undefined, context: string): Record<string,string>;
