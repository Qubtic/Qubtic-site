import { useEffect, useRef, useState } from 'react';
import './billing-panel.css';
const API='https://www.qubtic.tech/api/billing';
type Cadence='monthly'|'yearly'|'lifetime';
interface Order { polar_order_id:string;cadence:Cadence;status:string;amount:number;subtotal_amount:number;discount_amount:number;refunded_amount:number;currency:string;purchased_at:string }
interface Plan {cadence:Cadence}
interface Status {is_pro:boolean;orders:Order[];subscriptions:{cadence:string;status:string;current_period_end:string;cancel_at_period_end:boolean}[]}
function money(amount:number,currency:string){if(!Number.isFinite(amount)||!currency||!/^[A-Z]{3}$/i.test(currency))return 'Price at checkout';try{const formatter=new Intl.NumberFormat(undefined,{style:'currency',currency:currency.toUpperCase()});const digits=formatter.resolvedOptions().maximumFractionDigits??2;return formatter.format(amount/(10**digits));}catch{return 'Price at checkout';}}
function safeUUID():string{if(typeof crypto!=='undefined'&&typeof crypto.randomUUID==='function'){try{return crypto.randomUUID();}catch{}}return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=(Math.random()*16)|0;return (c==='x'?r:(r&0x3)|0x8).toString(16);});}
export function BillingPanel({token,onVerified}:{token:string;onVerified?:(pro:boolean)=>void}){
 const [plans,setPlans]=useState<Plan[]>([]);const [status,setStatus]=useState<Status|null>(null);const [error,setError]=useState('');const [busy,setBusy]=useState(false);const [pending,setPending]=useState(false);const [destination,setDestination]=useState('');const [destinationAction,setDestinationAction]=useState<'checkout'|'portal'|null>(null);const [previousUrl,setPreviousUrl]=useState('');
 const [selectedCadence,setSelectedCadence]=useState<Cadence>('yearly');
 const [showCheckoutModal,setShowCheckoutModal]=useState(false);
 const callback=useRef(onVerified);callback.current=onVerified;const running=useRef(false);const currentToken=useRef(token);currentToken.current=token;
 async function api(action:string,body?:unknown){
  const response=await fetch(`${API}/${action}`,{method:body===undefined?'GET':'POST',headers:{Authorization:`Bearer ${token}`,...(body===undefined?{}:{'Content-Type':'application/json'})},...(body===undefined?{}:{body:JSON.stringify(body)}),cache:'no-store',signal:AbortSignal.timeout(25000)});
  const data=await response.json();if(!response.ok)throw Object.assign(new Error(data.error||'Billing is unavailable. Please try again.'),{previous_url:data.previous_url});return data;
 }
 useEffect(()=>{
  setStatus(null);setPlans([]);setPending(false);setDestination('');setDestinationAction(null);setPreviousUrl('');
  if(!token)return;
  let active=true;
  Promise.all([api('catalog'),api('status')]).then(([catalog,next])=>{if(active){setPlans(catalog.plans);setStatus(next);setError('');callback.current?.(next.is_pro===true);}}).catch(err=>{if(active)setError(err.message);});
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
 useEffect(()=>{
  if(status?.is_pro) setShowCheckoutModal(false);
 },[status?.is_pro]);
 useEffect(()=>{
  if(!showCheckoutModal) return;
  const onKey=(e:KeyboardEvent)=>{if(e.key==='Escape')setShowCheckoutModal(false);};
  window.addEventListener('keydown',onKey);
  return()=>window.removeEventListener('keydown',onKey);
 },[showCheckoutModal]);
 async function open(action:'checkout'|'portal',replacePrevious=false){
  if(action==='checkout') setShowCheckoutModal(true);
  const channel=safeUUID();
  let launcher:Window|null=null;
  if(action==='checkout'){try{launcher=window.open(`https://www.qubtic.tech/billing/launch#${channel}`,'_blank');}catch{/* The checkout link remains available after the request. */}}
  setBusy(true);setError('');setDestination('');setDestinationAction(null);setPreviousUrl('');
  try{const data=await api(action,action==='checkout'?{cadence:selectedCadence,request_id:safeUUID(),...(replacePrevious?{replace_previous:true}:{})}:{});const url=new URL(data.url);
   if(url.protocol!=='https:'||!['polar.sh','buy.polar.sh','sandbox.polar.sh','sandbox-api.polar.sh','api.polar.sh','sandbox.buy.polar.sh'].includes(url.hostname)||url.username||url.password)throw new Error('Invalid billing destination.');
   setDestination(url.href);setDestinationAction(action);
   if(action==='checkout'&&launcher){
    const target=launcher;let attempts=0;
    const send=()=>{if(target.closed||++attempts>40){window.clearInterval(timer);return;}try{target.postMessage({type:'qubtic-billing-checkout',channel,url:url.href},'https://www.qubtic.tech');}catch{}};
    const timer=window.setInterval(send,250);send();
    try{if(!target.closed&&(target.location.href.startsWith('about:blank')||target.location.href.includes('/billing/launch'))){target.location.replace(url.href);}}catch{}
   }else if(action==='portal'){try{window.open(url.href,'_blank','noopener,noreferrer');}catch{/* The visible portal link remains available. */}}
   if(action==='checkout')setPending(true);
  }catch(err){launcher?.close();const previous=(err as Error&{previous_url?:string})?.previous_url;if(previous){try{const url=new URL(previous);if(url.protocol==='https:'&&['polar.sh','buy.polar.sh','sandbox.polar.sh','sandbox-api.polar.sh','api.polar.sh','sandbox.buy.polar.sh'].includes(url.hostname)&&!url.username&&!url.password)setPreviousUrl(url.href);}catch{/* Ignore an invalid recovery link. */}}setError(err instanceof Error?err.message:'Could not open billing.');}finally{setBusy(false);}
 }
  return <section className="qubtic-billing" aria-label="Pro billing and purchase history">
  <p>All Pro features are included. Select your payment option on Polar checkout.</p>
  <div className="qubtic-billing-plans">
   <article className="qubtic-billing-plan">
    <div className="qubtic-billing-plan-header">
     <div className="qubtic-billing-title-wrap">
      <h3>Pro access</h3>
      <span className="qubtic-billing-badge">⚡ Instant Unlock</span>
     </div>
     <span className="qubtic-billing-guarantee">14-day refund guarantee</span>
    </div>
    <p className="qubtic-billing-desc">Choose your billing option and enter any eligible discount code at Polar checkout.</p>
    <div className="qubtic-billing-cadences" role="radiogroup" aria-label="Available billing cadences">
     <button type="button" className={`qubtic-billing-cadence-pill ${selectedCadence==='monthly'?'qubtic-billing-cadence-pill--active':''}`} role="radio" aria-checked={selectedCadence==='monthly'} onClick={()=>setSelectedCadence('monthly')}>
      <span className="qubtic-billing-cadence-name">Monthly</span>
      <span className="qubtic-billing-cadence-tag">Flexible</span>
     </button>
     <button type="button" className={`qubtic-billing-cadence-pill ${selectedCadence==='yearly'?'qubtic-billing-cadence-pill--active':''}`} role="radio" aria-checked={selectedCadence==='yearly'} onClick={()=>setSelectedCadence('yearly')}>
      <span className="qubtic-billing-cadence-name">Yearly</span>
      <span className="qubtic-billing-cadence-tag qubtic-billing-cadence-tag--save">Save ~50%</span>
     </button>
     <button type="button" className={`qubtic-billing-cadence-pill ${selectedCadence==='lifetime'?'qubtic-billing-cadence-pill--active':''}`} role="radio" aria-checked={selectedCadence==='lifetime'} onClick={()=>setSelectedCadence('lifetime')}>
      <span className="qubtic-billing-cadence-name">Lifetime</span>
      <span className="qubtic-billing-cadence-tag">Pay once</span>
     </button>
    </div>
    <div className="qubtic-billing-cadence-hint">
     <span className="qubtic-billing-hint-bullet">✓</span>
     <span>{selectedCadence==='yearly'?'Annual billing: Best value for active teams & creators.':selectedCadence==='lifetime'?'Lifetime access: One-time payment, unlimited future updates.':'Monthly billing: Pay as you go, pause or cancel anytime.'}</span>
    </div>
    <ul className="qubtic-billing-features" role="list">
     <li className="qubtic-billing-feature-item"><span className="qubtic-billing-feature-check">✓</span><span>Full access to all Pro features and section drops</span></li>
     <li className="qubtic-billing-feature-item"><span className="qubtic-billing-feature-check">✓</span><span>Commercial license for unlimited personal &amp; client projects</span></li>
     <li className="qubtic-billing-feature-item"><span className="qubtic-billing-feature-check">✓</span><span>Instant activation &amp; zero seat restrictions</span></li>
    </ul>
    <button type="button" disabled={!token||busy||plans.length!==3||status?.is_pro} onClick={()=>void open('checkout')}>
     {busy?(
      <span className="qubtic-btn-spinner-wrap">
       <span className="qubtic-spinner" aria-hidden="true" />
       <span>Preparing checkout…</span>
      </span>
     ):status?.is_pro?'Pro active':!token?'Sign in to upgrade':'Purchase Pro'}
    </button>
    {!showCheckoutModal&&destination&&destinationAction==='checkout'&&(
     <div className="qubtic-billing-destination-box">
      <div className="qubtic-billing-destination-content">
       <span className="qubtic-billing-destination-icon">🚀</span>
       <div className="qubtic-billing-destination-text">
        <strong>Checkout tab opened in Polar</strong>
        <span>If your browser blocked popups, click below to proceed.</span>
       </div>
      </div>
      <a href={destination} target="_blank" rel="noopener noreferrer" className="qubtic-billing-checkout-link">Open Polar checkout</a>
     </div>
    )}
    <div className="qubtic-billing-trust">
     <span>🔒 256-bit encrypted checkout</span>
     <span className="qubtic-billing-trust-sep">·</span>
     <span>Powered by Polar</span>
    </div>
    {!showCheckoutModal&&previousUrl&&(
     <div className="qubtic-billing-recovery">
      <div className="qubtic-billing-recovery-header">
       <span className="qubtic-billing-recovery-icon">⚠️</span>
       <span>An earlier checkout is still open</span>
      </div>
      <div className="qubtic-billing-recovery-actions">
       <a href={previousUrl} target="_blank" rel="noopener noreferrer" className="qubtic-billing-recovery-link">Continue previous checkout</a>
       <button type="button" className="qubtic-billing-recovery-btn" disabled={busy} onClick={()=>void open('checkout',true)}>Start new Pro checkout</button>
      </div>
      <p>Close the previous checkout tab before paying to avoid two purchases.</p>
     </div>
    )}
    {showCheckoutModal&&(
     <div className="qubtic-billing-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="qubtic-checkout-modal-title" onClick={(e)=>{if(e.target===e.currentTarget)setShowCheckoutModal(false);}}>
      <div className="qubtic-billing-modal">
       <div className="qubtic-billing-modal-header">
        <div className="qubtic-billing-modal-title-row">
         <span className="qubtic-billing-modal-icon" aria-hidden="true">💎</span>
         <h3 id="qubtic-checkout-modal-title">Upgrade to Pro</h3>
        </div>
        <button type="button" className="qubtic-billing-modal-close" aria-label="Close checkout modal" onClick={()=>setShowCheckoutModal(false)}>✕</button>
       </div>
       <div className="qubtic-billing-modal-plan-summary">
        <div className="qubtic-billing-modal-plan-top">
         <span className="qubtic-billing-modal-plan-tier">Pro Access</span>
         <span className="qubtic-billing-modal-plan-badge">{selectedCadence==='yearly'?'Save ~50%':selectedCadence==='lifetime'?'Pay once':'Flexible'}</span>
        </div>
        <div className="qubtic-billing-modal-plan-cadence">{selectedCadence==='yearly'?'Yearly Plan (Annual billing)':selectedCadence==='lifetime'?'Lifetime Access (One-time payment)':'Monthly Plan (Cancel anytime)'}</div>
        <div className="qubtic-billing-modal-guarantee">🛡️ 14-day refund guarantee included with your purchase</div>
       </div>
       {busy&&(
        <div className="qubtic-billing-modal-status-loading">
         <span className="qubtic-modal-spinner" aria-hidden="true" />
         <div className="qubtic-billing-modal-status-info">
          <strong>Connecting to Polar secure checkout…</strong>
          <span>Preparing your checkout session. Tab will open automatically.</span>
         </div>
        </div>
       )}
       {!busy&&destination&&destinationAction==='checkout'&&(
        <div className="qubtic-billing-modal-status-ready">
         <div className="qubtic-billing-modal-ready-header">
          <span className="qubtic-billing-modal-ready-check">✓</span>
          <div className="qubtic-billing-modal-status-info">
           <strong>Checkout tab opened in Polar</strong>
           <span>If your browser blocked the window, click below to proceed:</span>
          </div>
         </div>
         <a href={destination} target="_blank" rel="noopener noreferrer" className="qubtic-billing-checkout-link qubtic-billing-modal-cta-btn">Open Polar checkout</a>
        </div>
       )}
       {!busy&&previousUrl&&(
        <div className="qubtic-billing-recovery">
         <div className="qubtic-billing-recovery-header">
          <span className="qubtic-billing-recovery-icon">⚠️</span>
          <span>An earlier checkout is still open</span>
         </div>
         <div className="qubtic-billing-recovery-actions">
          <a href={previousUrl} target="_blank" rel="noopener noreferrer" className="qubtic-billing-recovery-link">Continue previous checkout</a>
          <button type="button" className="btn-brand-secondary qubtic-billing-recovery-btn" disabled={busy} onClick={()=>void open('checkout',true)}>Start new Pro checkout</button>
         </div>
         <p>Close the previous checkout tab before paying to avoid two purchases.</p>
        </div>
       )}
       {!busy&&error&&(
        <div className="qubtic-billing-modal-error">
         <p className="commerce-feedback error" role="alert">{error}</p>
         <button type="button" className="btn-brand-secondary qubtic-billing-modal-retry-btn" onClick={()=>void open('checkout')}>Retry checkout</button>
        </div>
       )}
       <div className="qubtic-billing-modal-footer">
        <div className="qubtic-billing-trust"><span>🔒 256-bit encrypted Polar checkout</span></div>
        <button type="button" className="commerce-text-button qubtic-billing-modal-dismiss-btn" onClick={()=>setShowCheckoutModal(false)}>Close</button>
       </div>
      </div>
     </div>
    )}
   </article>
  </div>
  {destination&&destinationAction==='portal'&&<a href={destination} target="_blank" rel="noopener noreferrer">Continue to Polar</a>}
  {pending&&<p role="status">Waiting for payment verification. Access will refresh automatically.</p>}
  {error&&<p role="alert">{error}</p>}
  {token&&<div className="qubtic-billing-actions"><button type="button" disabled={busy} onClick={()=>void refresh()}>{busy?'Checking billing…':'Refresh billing'}</button><button type="button" disabled={busy||!status?.orders.length} onClick={()=>void open('portal')}>Manage billing &amp; invoices</button></div>}
  <h3>Purchase history</h3>
  {!status?.orders.length?<p>No purchases to display.</p>:<ul className="qubtic-billing-history">{status.orders.map(order=><li key={order.polar_order_id}><strong>Pro {order.cadence}</strong><span>{money(order.amount,order.currency)} · {order.status}</span><span>{new Date(order.purchased_at).toLocaleDateString()}</span>{order.discount_amount>0&&<span>Discount: {money(order.discount_amount,order.currency)}</span>}{order.refunded_amount>0&&<span>Refund: {money(order.refunded_amount,order.currency)}</span>}</li>)}</ul>}
  {status?.subscriptions.map((sub,index)=><p key={index}>Pro {sub.cadence} · {sub.status}{sub.current_period_end?` · ${sub.cancel_at_period_end?'Ends':'Current period ends'} ${new Date(sub.current_period_end).toLocaleDateString()}`:''}</p>)}
 </section>;
}
