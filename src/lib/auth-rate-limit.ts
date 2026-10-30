import 'server-only';
import { createHmac } from 'node:crypto';
import { supabase } from './supabase';
export async function authRateLimit(request:Request,email:string,plugin:string,action:string){
 const secret=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!secret)return false;
 const ip=(request.headers.get('x-forwarded-for')||'unknown').split(',')[0].trim();
 for(const [identity,max] of [[`email:${plugin}:${action}:${email.toLowerCase().trim()}`,action==='send'?5:15],[`ip:${action}:${ip}`,60]] as const){
  const bucket=createHmac('sha256',secret).update(identity).digest('hex');
  const {data,error}=await supabase.rpc('billing_throttle',{p_bucket:bucket,p_limit:max,p_seconds:900});
  if(error||data!==true)return false;
 }
 return true;
}
