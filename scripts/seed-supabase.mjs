import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const STORE_DIR = path.join(process.cwd(), 'src', 'data', 'store');

function readJson(filename, fallback) {
  const p = path.join(STORE_DIR, filename);
  if (!fs.existsSync(p)) return fallback;
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

async function seed() {
  console.log('--- Starting Supabase Data Seeding ---');

  // 1. Admin Users
  console.log('Seeding Admin Users...');
  const passHash = crypto.createHash('sha256').update('s#Z3@GhyLBa9aeD').digest('hex');
  const adminUsers = [
    { name: 'rafi', email: 'rafikabir05.rk@gmail.com', password_hash: passHash, role: 'admin' },
    { name: 'sunvi', email: 'mainulsunvi@gmail.com', password_hash: passHash, role: 'admin' }
  ];
  for (const admin of adminUsers) {
    const { error } = await supabase
      .from('admin_users')
      .upsert(admin, { onConflict: 'email' });
    if (error) console.error('Admin upsert error:', error);
    else console.log(`✓ Admin user synced: ${admin.email}`);
  }

  // 2. Projects
  console.log('Seeding Projects...');
  const projectsData = readJson('projects.json', []);
  for (let i = 0; i < projectsData.length; i++) {
    const p = projectsData[i];
    const item = {
      slug: p.slug,
      title: p.title,
      category: p.category,
      client: p.client || null,
      year: p.year || null,
      metric: p.metric || null,
      live_url: p.liveUrl || null,
      short_description: p.shortDescription || null,
      challenge: p.challenge || null,
      solution: p.solution || null,
      results: p.results || [],
      tech_stack: p.techStack || [],
      testimonial: p.testimonial || {},
      image: p.image || null,
      order_index: i,
    };
    const { error } = await supabase.from('projects').upsert(item, { onConflict: 'slug' });
    if (error) console.error(`Project error for ${p.slug}:`, error);
    else console.log(`✓ Project synced: ${p.title} (${p.slug})`);
  }

  // 3. Services
  console.log('Seeding Services...');
  const servicesData = readJson('services.json', []);
  for (let i = 0; i < servicesData.length; i++) {
    const s = servicesData[i];
    const item = {
      slug: s.slug,
      title: s.title,
      short_description: s.shortDescription || null,
      long_description: s.longDescription || null,
      icon: s.icon || 'Globe',
      features: s.features || [],
      process: s.process || [],
      tech_stack: s.techStack || [],
      faq: s.faq || [],
      order_index: i,
    };
    const { error } = await supabase.from('services').upsert(item, { onConflict: 'slug' });
    if (error) console.error(`Service error for ${s.slug}:`, error);
    else console.log(`✓ Service synced: ${s.title} (${s.slug})`);
  }

  // 4. Pricing Plans
  console.log('Seeding Pricing Plans...');
  const pricingData = readJson('pricing.json', { web: [], saas: [], shopify: [], framer: [] });
  // Clear existing pricing plans to re-insert fresh
  await supabase.from('pricing_plans').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  for (const category of ['web', 'saas', 'shopify', 'framer']) {
    const plans = pricingData[category] || [];
    for (let i = 0; i < plans.length; i++) {
      const plan = plans[i];
      const item = {
        category,
        name: plan.name,
        price_monthly: plan.price?.monthly || 0,
        price_annual: plan.price?.annual || 0,
        description: plan.description || '',
        features: plan.features || [],
        popular: !!plan.popular,
        cta: plan.cta || 'Get Started',
        order_index: i,
      };
      const { error } = await supabase.from('pricing_plans').insert(item);
      if (error) console.error(`Pricing plan error for ${category}/${plan.name}:`, error);
      else console.log(`✓ Pricing plan synced: [${category}] ${plan.name}`);
    }
  }

  // 5. Blog Posts
  console.log('Seeding Blog Posts...');
  const blogData = readJson('blog.json', []);
  for (let i = 0; i < blogData.length; i++) {
    const b = blogData[i];
    const item = {
      slug: b.slug,
      title: b.title,
      excerpt: b.excerpt || '',
      content: b.content || '',
      date: b.date || 'Jan 1, 2026',
      reading_time: b.readingTime || '5 min read',
      category: b.category || 'General',
      author: b.author || 'qubtic Team',
      image: b.image || null,
      order_index: i,
    };
    const { error } = await supabase.from('blog_posts').upsert(item, { onConflict: 'slug' });
    if (error) console.error(`Blog error for ${b.slug}:`, error);
    else console.log(`✓ Blog post synced: ${b.title}`);
  }

  // 6. Site Settings
  console.log('Seeding Site Settings...');
  const settingsData = readJson('settings.json', {});
  const settingsItem = {
    id: 'global',
    hero_badge: settingsData.heroBadge || '',
    hero_title: settingsData.heroTitle || '',
    hero_subtitle: settingsData.heroSubtitle || '',
    primary_cta_text: settingsData.primaryCtaText || 'Explore Our Work',
    contact_email: settingsData.contactEmail || 'hello@qubtic.tech',
    contact_phone: settingsData.contactPhone || '+1 (555) 234-5678',
    contact_address: settingsData.contactAddress || '',
    admin_password_hash: settingsData.adminPasswordHash || 's#Z3@GhyLBa9aeD',
    testimonials: settingsData.testimonials || [],
    team: settingsData.team || [],
  };
  const { error: settingsErr } = await supabase.from('site_settings').upsert(settingsItem, { onConflict: 'id' });
  if (settingsErr) console.error('Settings error:', settingsErr);
  else console.log('✓ Site settings synced');

  // 7. Inquiries
  console.log('Seeding Inquiries...');
  const inquiriesData = readJson('inquiries.json', []);
  for (const inq of inquiriesData) {
    const item = {
      name: inq.name,
      email: inq.email,
      company: inq.company || null,
      service: inq.service || 'Web Development',
      budget: inq.budget || '$5k-$15k',
      message: inq.message || '',
      status: 'new',
      created_at: inq.createdAt || new Date().toISOString(),
    };
    const { error } = await supabase.from('inquiries').insert(item);
    if (error) console.error('Inquiry error:', error);
    else console.log(`✓ Inquiry synced: from ${inq.name}`);
  }

  console.log('--- Seeding Completed Successfully! ---');
}

seed().catch((err) => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
