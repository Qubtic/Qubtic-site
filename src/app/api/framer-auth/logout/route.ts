import { randomBytes } from 'node:crypto';
import { actor, BillingError, billingHeaders, check, database } from '@/lib/billing/core';
export function OPTIONS(){return new Response(null,{status:204,headers:billingHeaders});}
export async function POST(request:Request){try{
 const user=await actor(request);const token=request.headers.get('authorization')!.slice(7);
 const replacement=`qbt_fr_${user.plugin.replace(/[^a-z0-9]/gi,'').slice(0,8)}_${randomBytes(24).toString('hex')}`;
 const {error}=await database().from('framer_users').update({auth_token:replacement}).eq('id',user.id).eq('auth_token',token);check(error);
 return Response.json({success:true},{headers:billingHeaders});
}catch(error){return Response.json({error:'Could not revoke this session.'},{status:error instanceof BillingError?error.status:503,headers:billingHeaders});}}
