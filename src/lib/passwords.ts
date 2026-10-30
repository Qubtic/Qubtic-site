import 'server-only';
import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
export function hashPassword(password:string){const salt=randomBytes(16).toString('hex');return `scrypt:${salt}:${scryptSync(password,salt,64).toString('hex')}`;}
export function verifyPassword(password:string,stored:string){
 if(stored.startsWith('scrypt:')){const [scheme,salt,value]=stored.split(':');if(scheme!=='scrypt'||!salt||!value)return false;const expected=Buffer.from(value,'hex'),actual=scryptSync(password,salt,64);return expected.length===actual.length&&timingSafeEqual(expected,actual);}
 // Legacy accounts are accepted once and upgraded after a successful sign-in.
 return [password,'qubtic_pwd_salt_'+password].some(value=>{const hash=Buffer.from(createHash('sha256').update(value).digest('hex'));const old=Buffer.from(stored);return hash.length===old.length&&timingSafeEqual(hash,old);});
}
