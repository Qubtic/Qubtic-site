'use client';
import { useEffect,useState } from 'react';
import { BillingPanel } from './BillingPanel';
import './billing-account.css';
export function BillingAccount(){
 const [plugin,setPlugin]=useState('whatsapp-commerce');const [token,setToken]=useState('');const [theme,setTheme]=useState<'dark'|'light'>('dark');
 useEffect(()=>{try{setToken(localStorage.getItem(`qubtic_framer_token:${plugin}`)||'');}catch{setToken('');}},[plugin]);
 return <main className="billing-account" data-theme={theme}><section><h1>Qubtic billing</h1><button type="button" onClick={()=>setTheme(theme==='dark'?'light':'dark')}>Switch to {theme==='dark'?'light':'dark'} mode</button><label>Plugin<select value={plugin} onChange={event=>setPlugin(event.target.value)}><option value="whatsapp-commerce">WhatsApp Commerce</option><option value="frame-drop">FrameDrop</option><option value="qube-auth">Qube Auth</option></select></label>{!token&&<p><a href={`/auth/${plugin}`}>Sign in to view purchases and manage billing</a></p>}<BillingPanel key={plugin} token={token}/></section></main>;
}
