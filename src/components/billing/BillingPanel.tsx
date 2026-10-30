import { useEffect, useRef, useState } from 'react';
import './billing-panel.css';
const API='https://www.qubtic.tech/api/billing';
type Cadence='monthly'|'yearly'|'lifetime';
interface Order { polar_order_id:string;cadence:Cadence;status:string;amount:number;refunded_amount:number;currency:string;purchased_at:string }
interface Status {is_pro:boolean;orders:Order[];subscriptions:{cadence:string;status:string;current_period_end:string;cancel_at_period_end:boolean}[]}
function money(amount:number,currency:string){const formatter=new Intl.NumberFormat(undefined,{style:'currency',currency});const digits=formatter.resolvedOptions().maximumFractionDigits??2;return formatter.format(amount/(10**digits));}
export function BillingPanel({token,onVerified}:{token:string;onVerified?:(pro:boolean)=>void}){
 const [plans,setPlans]=useState<Cadence[]>([]);const [status,setStatus]=useState<Status|null>(null);const [error,setError]=useState('');const [busy,setBusy]=useState(false);const [pending,setPending]=useState(false);const [destination,setDestination]=useState('');
 const callback=useRef(onVerified);callback.current=onVerified;const running=useRef(false);const currentToken=useRef(token);currentToken.current=token;
 async function api(action:string,body?:unknown){
  const response=await fetch(`${API}/${action}`,{method:body===undefined?'GET':'POST',headers:{Authorization:`Bearer ${token}`,...(body===undefined?{}:{'Content-Type':'application/json'})},...(body===undefined?{}:{body:JSON.stringify(body)}),cache:'no-store',signal:AbortSignal.timeout(25000)});
  const data=await response.json();if(!response.ok)throw new Error(data.error||'Billing is unavailable. Please try again.');return data;
 }
 useEffect(()=>{
  setStatus(null);setPlans([]);setPending(false);setDestination('');
  if(!token)return;
  let active=true;
  Promise.all([api('catalog'),api('status')]).then(([catalog,next])=>{if(active){setPlans(catalog.plans.map((p:{cadence:Cadence})=>p.cadence));setStatus(next);setError('');callback.current?.(next.is_pro===true);}}).catch(err=>{if(active)setError(err.message);});
  return()=>{active=false;};
 },[token]);
 async function refresh(){
  if(!token||running.current)return;running.current=true;setBusy(true);
  try{await api('refresh',{});const next=await api('status');if(currentToken.current!==token)return;setStatus(next);callback.current?.(next.is_pro===true);setError('');if(next.is_pro)setPending(false);}catch(err){setError(err instanceof Error?err.message:'Could not refresh billing.');}finally{running.current=false;setBusy(false);}
 }
 useEffect(()=>{
  if(!token)return;const focus=()=>{void refresh();};window.addEventListener('focus',focus);
  let count=0;const timer=pending?setInterval(()=>{if(++count>8){setPending(false);return;}void refresh();},15000):undefined;
  return()=>{window.removeEventListener('focus',focus);if(timer)clearInterval(timer);};
 },[pending,token]);
 async function open(action:'checkout'|'portal',cadence?:Cadence){
  const tab=window.open('about:blank','_blank');if(tab)tab.opener=null;setBusy(true);setError('');
  try{const data=await api(action,action==='checkout'?{cadence,request_id:crypto.randomUUID()}:{});const url=new URL(data.url);
   if(url.protocol!=='https:'||!['polar.sh','buy.polar.sh','sandbox.polar.sh','sandbox-api.polar.sh','api.polar.sh','sandbox.buy.polar.sh'].includes(url.hostname)||url.username||url.password)throw new Error('Invalid billing destination.');
   if(tab)tab.location.href=url.href;else setDestination(url.href);if(action==='checkout')setPending(true);
  }catch(err){tab?.close();setError(err instanceof Error?err.message:'Could not open billing.');}finally{setBusy(false);}
 }
 return <section className="qubtic-billing" aria-label="Pro billing and purchase history">
  <p>Monthly, yearly, and lifetime include the same Pro features. Choose how you pay.</p>
  <div className="qubtic-billing-plans">{(['monthly','yearly','lifetime'] as Cadence[]).map(cadence=><article className="qubtic-billing-plan" key={cadence}><h3>Pro {cadence}</h3><p>{cadence==='lifetime'?'One payment, lifetime access.':`Billed ${cadence}.`}</p><p>{plans.includes(cadence)?'Price shown securely at checkout.':'Checkout coming soon.'}</p><button type="button" disabled={!token||busy||!plans.includes(cadence)||status?.is_pro} onClick={()=>void open('checkout',cadence)}>{status?.is_pro?'Pro active':!token?'Sign in to upgrade':`Purchase Pro ${cadence}`}</button></article>)}</div>
  {pending&&<p role="status">Waiting for payment verification. Access will refresh automatically.</p>}
  {destination&&<a href={destination} target="_blank" rel="noopener noreferrer">Continue to Polar</a>}
  {error&&<p role="alert">{error}</p>}
  {token&&<div className="qubtic-billing-actions"><button type="button" disabled={busy} onClick={()=>void refresh()}>{busy?'Checking billing…':'Refresh billing'}</button><button type="button" disabled={busy||!status?.orders.length} onClick={()=>void open('portal')}>Manage billing &amp; invoices</button></div>}
  <h3>Purchase history</h3>
  {!status?.orders.length?<p>No purchases to display.</p>:<ul className="qubtic-billing-history">{status.orders.map(order=><li key={order.polar_order_id}><strong>Pro {order.cadence}</strong><span>{money(order.amount,order.currency)} · {order.status}</span><span>{new Date(order.purchased_at).toLocaleDateString()}</span>{order.refunded_amount>0&&<span>Refund: {money(order.refunded_amount,order.currency)}</span>}</li>)}</ul>}
  {status?.subscriptions.map((sub,index)=><p key={index}>Pro {sub.cadence} · {sub.status}{sub.current_period_end?` · ${sub.cancel_at_period_end?'Ends':'Current period ends'} ${new Date(sub.current_period_end).toLocaleDateString()}`:''}</p>)}
 </section>;
}
