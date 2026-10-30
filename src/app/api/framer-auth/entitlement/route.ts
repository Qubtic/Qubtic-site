import { actor, BillingError, billingHeaders, paidAccess } from '@/lib/billing/core';
export function OPTIONS(){return new Response(null,{status:204,headers:{...billingHeaders,'Access-Control-Allow-Headers':'Content-Type, Authorization, x-framer-token, x-plugin-slug'}});}
export async function GET(request:Request){
 try{const user=await actor(request);const expected=request.headers.get('x-plugin-slug');if(expected&&expected!==user.plugin)throw new BillingError('Plugin session mismatch.',403);const pro=await paidAccess(user.id,user.plugin);return Response.json({success:true,user_id:user.id,email:user.email,plugin_slug:user.plugin,tier:pro?'pro':'free',is_pro:pro,status:'active',capabilities:pro?['pro_components','token_sync','bulk_export','custom_styles']:['free_components']},{headers:billingHeaders});}
 catch(error){return Response.json({error:error instanceof BillingError?error.message:'Access could not be verified.'},{status:error instanceof BillingError?error.status:503,headers:billingHeaders});}
}
