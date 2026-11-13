export const ORDER_BUCKET: string;
export interface OrderClaim { path: string; owned: boolean; record: { version: number; fingerprint: string; orderId: string; state: string; result?: any; [key: string]: unknown } }
export function createOrderLedger(storage: any): { claim(identity: string, fingerprint: string): Promise<OrderClaim>; finish(claim: OrderClaim, state: string, result: unknown): Promise<void> };
