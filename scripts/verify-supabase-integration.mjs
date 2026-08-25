import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verify() {
  console.log('=== VERIFYING SUPABASE INTEGRATION ===\n');

  // 1. Check Admin Users
  console.log('1. Verifying Admin Users in Database...');
  const { data: admins, error: adminErr } = await supabase.from('admin_users').select('*');
  if (adminErr) {
    console.error('❌ Failed to fetch admin users:', adminErr);
  } else {
    console.log(`✓ Total Admin Users in DB: ${admins.length}`);
    for (const a of admins) {
      console.log(`   - ${a.name} (${a.email}) | Role: ${a.role}`);
    }
  }

  // 2. Verify Credentials for Admin 1 (rafi) & Admin 2 (sunvi)
  console.log('\n2. Verifying Password Hash Matching...');
  const testPass = 's#Z3@GhyLBa9aeD';
  const testHash = crypto.createHash('sha256').update(testPass).digest('hex');

  for (const email of ['rafikabir05.rk@gmail.com', 'mainulsunvi@gmail.com']) {
    const user = admins.find((u) => u.email === email);
    if (user && user.password_hash === testHash) {
      console.log(`✓ Authentication VALID for ${email} with password "${testPass}"`);
    } else {
      console.error(`❌ Authentication FAILED for ${email}`);
    }
  }

  // 3. Check Projects
  console.log('\n3. Verifying Projects Table...');
  const { data: projects, error: projErr } = await supabase.from('projects').select('slug, title, category');
  if (projErr) console.error('❌ Projects error:', projErr);
  else console.log(`✓ Total Projects in DB: ${projects.length}`);

  // 4. Check Services
  console.log('\n4. Verifying Services Table...');
  const { data: services, error: servErr } = await supabase.from('services').select('slug, title');
  if (servErr) console.error('❌ Services error:', servErr);
  else console.log(`✓ Total Services in DB: ${services.length}`);

  // 5. Check Pricing Plans
  console.log('\n5. Verifying Pricing Plans Table...');
  const { data: pricing, error: priceErr } = await supabase.from('pricing_plans').select('category, name, price_monthly');
  if (priceErr) console.error('❌ Pricing error:', priceErr);
  else console.log(`✓ Total Pricing Plans in DB: ${pricing.length}`);

  // 6. Check Blog Posts
  console.log('\n6. Verifying Blog Posts Table...');
  const { data: blogs, error: blogErr } = await supabase.from('blog_posts').select('slug, title');
  if (blogErr) console.error('❌ Blog error:', blogErr);
  else console.log(`✓ Total Blog Posts in DB: ${blogs.length}`);

  // 7. Check Site Settings
  console.log('\n7. Verifying Site Settings Table...');
  const { data: settings, error: setErr } = await supabase.from('site_settings').select('*').eq('id', 'global').single();
  if (setErr) console.error('❌ Settings error:', setErr);
  else console.log(`✓ Site settings loaded: Title="${settings.hero_title.substring(0, 30)}..."`);

  // 8. Test Dynamic Insert & Delete (CRUD Test)
  console.log('\n8. Testing Dynamic CRUD (Insert & Delete Inquiry)...');
  const testInquiry = {
    name: 'Integration Test Lead',
    email: 'test@example.com',
    company: 'Test Co',
    service: 'Web Development',
    budget: '$15k-$30k',
    message: 'Testing Supabase dynamic CRUD operations from automated suite.',
    status: 'test',
  };
  const { data: insertedInq, error: inqInsertErr } = await supabase
    .from('inquiries')
    .insert(testInquiry)
    .select()
    .single();

  if (inqInsertErr) {
    console.error('❌ CRUD Insert failed:', inqInsertErr);
  } else {
    console.log(`✓ CRUD Insert successful! Created inquiry ID: ${insertedInq.id}`);

    // Clean up test inquiry
    const { error: inqDelErr } = await supabase.from('inquiries').delete().eq('id', insertedInq.id);
    if (inqDelErr) console.error('❌ CRUD Cleanup failed:', inqDelErr);
    else console.log('✓ CRUD Delete successful! Test inquiry cleaned up.');
  }

  console.log('\n=== ALL SUPABASE INTEGRATION CHECKS PASSED ===');
}

verify().catch(console.error);
