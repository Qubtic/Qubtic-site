import type { Metadata } from 'next';
import { BillingAccount } from '@/components/billing/BillingAccount';
export const metadata:Metadata={title:'Billing & purchases — Qubtic',robots:{index:false,follow:false}};
export default function Page(){return <BillingAccount/>;}
