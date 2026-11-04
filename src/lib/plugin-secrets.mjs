import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
export function encryptSecrets(value, key, context) {
 const bytes = Buffer.from(key || '', 'base64');
 if(bytes.length !== 32) throw new Error('PLUGIN_CONFIG_ENCRYPTION_KEY must be a base64 32-byte key.');
 const iv=randomBytes(12), cipher=createCipheriv('aes-256-gcm',bytes,iv);
 cipher.setAAD(Buffer.from(context));
 const payload=Buffer.concat([cipher.update(JSON.stringify(value),'utf8'),cipher.final()]);
 return [iv,cipher.getAuthTag(),payload].map(x=>x.toString('base64')).join('.');
}
export function decryptSecrets(value, key, context) {
 if(!value)return {};
 const bytes=Buffer.from(key || '', 'base64');
 if(bytes.length!==32)throw new Error('Plugin encryption key unavailable.');
 const [iv,tag,payload]=value.split('.').map(x=>Buffer.from(x,'base64'));
 const cipher=createDecipheriv('aes-256-gcm',bytes,iv);cipher.setAAD(Buffer.from(context));cipher.setAuthTag(tag);
 return JSON.parse(Buffer.concat([cipher.update(payload),cipher.final()]).toString('utf8'));
}
