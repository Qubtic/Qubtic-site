import type { Metadata } from 'next';
import './return.css';
export const metadata:Metadata={title:'Return to your plugin — Qubtic',robots:{index:false,follow:false}};
export default function BillingReturn(){return <main className="billing-return"><section aria-labelledby="billing-return-title"><p>Qubtic / Billing</p><h1 id="billing-return-title">Return to your plugin</h1><p>Your payment status is verified securely with Polar. Return to FrameDrop or WhatsApp Commerce to see the latest plan and purchase history.</p><p>If you completed checkout, activation can take a few moments. The plugin will check automatically; you can also select Refresh billing.</p><a href="/">Back to Qubtic</a></section></main>;}
