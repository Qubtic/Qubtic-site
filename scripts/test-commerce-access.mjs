import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID, randomBytes, createHash } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';

const digest = value => createHash('sha256').update(value).digest('hex');
async function database() {
  const db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create role service_role;
    create schema auth; create table auth.users(id uuid primary key, email text, email_confirmed_at timestamptz, banned_until timestamptz);`);
  await db.exec(await readFile(new URL('../supabase/whatsapp_commerce.sql', import.meta.url), 'utf8'));
  return db;
}
async function identity(db, n, verified = true) {
  const id = randomUUID(), email = `designer${n}@example.test`;
  const device = randomBytes(32).toString('hex'), code = randomBytes(8).toString('hex').toUpperCase(), token = `wc_${randomBytes(32).toString('hex')}`;
  await db.query('insert into auth.users values ($1,$2,$3,null)', [id, email, verified ? new Date().toISOString() : null]);
  await db.query("insert into commerce_pairing(device_hash,user_code,expires_at) values($1,$2,now()+interval '10 minutes')", [digest(device), code]);
  return { id, email, device, code, token, hash: digest(token) };
}
async function confirm(db, user) { return (await db.query('select commerce_confirm_pair($1,$2,$3,$4) as ok', [user.code,user.id,user.token,user.hash])).rows[0].ok; }
async function access(db, user, claim = true) { return (await db.query('select commerce_access($1,$2) as access', [user.hash,claim])).rows[0].access; }

test('30 verified accounts receive unique places; repeated and excess claims cannot expand the campaign', async () => {
  const db = await database();
  try {
    const users = [];
    for (let n=0;n<35;n++) { const user = await identity(db,n); await confirm(db,user); users.push(user); }
    const results = await Promise.all(users.map(user => access(db,user)));
    assert.equal(results.filter(result => result.is_pro).length,30);
    assert.deepEqual(results.slice(0,30).map(result => result.early_bird_number),Array.from({length:30},(_,i)=>i+1));
    assert.ok(results.slice(30).every(result => result.authenticated && !result.is_pro && result.early_bird_number === null));
    const repeated = await Promise.all(Array.from({length:10},()=>access(db,users[0])));
    assert.ok(repeated.every(result => result.early_bird_number === 1 && result.claimed === 30));
    await db.query('delete from auth.users where id=$1',[users[1].id]);
    assert.equal((await access(db,users[34])).is_pro,false,'Deleting a member must never create a 31st lifetime campaign place');
    assert.equal((await db.query('select claimed_count from commerce_campaign')).rows[0].claimed_count,30);
  } finally { await db.close(); }
});

test('pairing requires verified email, returns a private token once, and refuses expired or rebound codes', async () => {
  const db = await database();
  try {
    const unverified = await identity(db,'unverified',false);
    await assert.rejects(confirm(db,unverified),/Verified account required/);
    const user = await identity(db,'valid');
    assert.equal((await db.query('select commerce_resolve_pair($1) as result',[digest(user.device)])).rows[0].result.status,'pending');
    assert.equal(await confirm(db,user),true);
    assert.equal(await confirm(db,user),true,'same-account confirmation is idempotent');
    const other = await identity(db,'other');
    assert.equal(await confirm(db,{...other,code:user.code}),false,'another account cannot rebind an approved code');
    const result = (await db.query('select commerce_resolve_pair($1) as result',[digest(user.device)])).rows[0].result;
    assert.equal(result.status,'success'); assert.equal(result.token,user.token);
    assert.equal((await db.query('select token_delivery from commerce_pairing where device_hash=$1',[digest(user.device)])).rows[0].token_delivery,null);
    assert.equal((await db.query('select commerce_resolve_pair($1) as result',[digest(user.device)])).rows[0].result.status,'expired');
    await db.query("update commerce_pairing set expires_at=now()-interval '1 second' where user_code=$1",[other.code]);
    assert.equal(await confirm(db,other),false);
  } finally { await db.close(); }
});

test('revocation, suspension, unverified email, expiry and paid launch all close access', async () => {
  const db = await database();
  try {
    const user = await identity(db,'lifecycle'); await confirm(db,user);
    assert.equal((await access(db,user)).is_pro,true);
    await db.exec("update commerce_campaign set phase='paid_launch'");
    const launched = await access(db,user); assert.equal(launched.is_pro,false); assert.equal(launched.phase,'paid_launch');
    assert.equal(launched.early_bird_number,1,'launch preserves the original grant record');
    await db.exec("update commerce_campaign set phase='early_access'");
    await db.query('update commerce_members set enabled=false where user_id=$1',[user.id]);
    assert.equal((await access(db,user)).authenticated,false);
    await db.query('update commerce_members set enabled=true where user_id=$1',[user.id]);
    await db.query("update auth.users set banned_until=now()+interval '1 day' where id=$1",[user.id]);
    assert.equal((await access(db,user)).authenticated,false);
    await db.query('update auth.users set banned_until=null,email_confirmed_at=null where id=$1',[user.id]);
    assert.equal((await access(db,user)).authenticated,false);
    await db.query('update auth.users set email_confirmed_at=now() where id=$1',[user.id]);
    await db.query('update commerce_sessions set revoked_at=now() where token_hash=$1',[user.hash]);
    assert.equal((await access(db,user)).authenticated,false);
    await db.query("update commerce_sessions set revoked_at=null,expires_at=now()-interval '1 second' where token_hash=$1",[user.hash]);
    assert.equal((await access(db,user)).authenticated,false);
    assert.equal((await access(db,{hash:digest('made-up-session')})).authenticated,false);
  } finally { await db.close(); }
});

test('anonymous and authenticated browser roles cannot edit grants or invoke private functions', async () => {
  const db = await database();
  try {
    for (const role of ['anon','authenticated']) {
      await db.exec(`set role ${role}`);
      await assert.rejects(db.exec('select * from public.commerce_sessions'),/permission denied/);
      await assert.rejects(db.exec("update public.commerce_campaign set phase='early_access'"),/permission denied/);
      await assert.rejects(db.query('select public.commerce_access($1,true)',['fake']),/permission denied/);
      await assert.rejects(db.query('select public.commerce_resolve_pair($1)',['fake']),/permission denied/);
      await db.exec('reset role');
    }
  } finally { await db.close(); }
});


test('rate limits are counted atomically and reset only when their server window ends',async()=>{
  const db=await database();
  try {
    const results=await Promise.all(Array.from({length:8},()=>db.query('select commerce_throttle($1,5,900) as allowed',['private-bucket'])));
    assert.deepEqual(results.map(result=>result.rows[0].allowed),[true,true,true,true,true,false,false,false]);
    await db.exec("update commerce_rate_limits set resets_at=now()-interval '1 second'");
    assert.equal((await db.query('select commerce_throttle($1,5,900) as allowed',['private-bucket'])).rows[0].allowed,true);
  } finally {await db.close();}
});
