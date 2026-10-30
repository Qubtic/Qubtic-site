import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

test('shared auth migration preserves per-plugin accounts and keeps account/session tables server-only', async () => {
  const db = new PGlite();
  try {
    await db.exec('create role anon; create role authenticated; create role service_role;');
    for (const file of ['framer_users.sql', 'pairing_sessions.sql', 'whatsapp_commerce_shared_auth.sql', 'whatsapp_commerce_shared_auth.sql']) {
      await db.exec(await readFile(new URL(`../supabase/${file}`, import.meta.url), 'utf8'));
    }
    await db.exec("insert into framer_users(email,plugin_slug,plugin_name,auth_token) values ('same@example.test','frame-drop','Frame Drop','drop-token'), ('same@example.test','whatsapp-commerce','WhatsApp Commerce','commerce-token');");
    const { rows } = await db.query('select plugin_slug,plan from framer_users order by plugin_slug');
    assert.deepEqual(rows, [{ plugin_slug: 'frame-drop', plan: 'free' }, { plugin_slug: 'whatsapp-commerce', plan: 'free' }]);
    await db.exec("update framer_users set plan='pro', metadata='{\"is_early_bird\":true}' where plugin_slug='frame-drop'; update framer_users set plan='pro' where plugin_slug='whatsapp-commerce';");
    const policy = await readFile(new URL('../supabase/free_pro_only.sql', import.meta.url), 'utf8');
    await db.exec(policy); await db.exec(policy);
    const updated = await db.query('select plugin_slug,plan,metadata from framer_users order by plugin_slug');
    assert.equal(updated.rows[0].plan, 'free'); assert.equal(updated.rows[1].plan, 'pro');
    assert.equal(updated.rows[0].metadata.is_early_bird, undefined);
    await assert.rejects(() => db.exec("update framer_users set plan='enterprise'"));
    const policies = await db.query("select policyname from pg_policies where tablename in ('framer_users','framer_pairing_sessions')");
    assert.equal(policies.rows.length, 2);
    for (const role of ['anon', 'authenticated']) {
      const grants = await db.query(`select has_table_privilege('${role}','public.framer_users','SELECT') as users, has_table_privilege('${role}','public.framer_pairing_sessions','SELECT') as pairing`);
      assert.deepEqual(grants.rows[0], { users: false, pairing: false });
    }
  } finally { await db.close(); }
});
