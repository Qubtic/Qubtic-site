'use client';
import { useEffect, useState } from 'react';
import './launch.css';

const polarHosts=new Set(['polar.sh','buy.polar.sh','sandbox.polar.sh','sandbox-api.polar.sh','api.polar.sh','sandbox.buy.polar.sh']);
export default function BillingLaunch(){
 const [waiting,setWaiting]=useState(false);
 useEffect(()=>{
  const channel=window.location.hash.slice(1);
  const opener=window.opener;
  if(!opener || !/^[0-9a-f-]{36}$/i.test(channel)){setWaiting(true);return;}
  const receive=(event:MessageEvent)=>{
   if(event.source!==opener || event.data?.type!=='qubtic-billing-checkout' || event.data?.channel!==channel || typeof event.data?.url!=='string')return;
   try{const url=new URL(event.data.url);if(url.protocol!=='https:' || !polarHosts.has(url.hostname) || url.username || url.password)return;window.location.replace(url.href);}catch{/* Keep the waiting page for an invalid destination. */}
  };
  window.addEventListener('message',receive);
  const timer=window.setTimeout(()=>setWaiting(true),15000);
  opener.postMessage({type:'qubtic-billing-ready',channel},'*');
  return()=>{window.removeEventListener('message',receive);window.clearTimeout(timer);};
 },[]);
 return <main className="billing-launch"><section className="billing-launch__content" aria-labelledby="billing-launch-title"><span className="billing-launch__spinner" aria-hidden="true"/><h1 id="billing-launch-title">Opening Polar checkout</h1><p role="status">Please wait while your checkout loads.</p>{waiting&&<p className="billing-launch__recovery">Checkout is taking longer than expected. Return to the plugin and select Open Polar checkout, or try Purchase Pro again.</p>}</section></main>;
}
