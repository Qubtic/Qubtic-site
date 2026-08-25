import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { supabase } from './supabase';

const STORE_DIR = path.join(process.cwd(), 'src', 'data', 'store');

// Ensure fallback store directory exists
function ensureStoreDir() {
  if (!fs.existsSync(STORE_DIR)) {
    try {
      fs.mkdirSync(STORE_DIR, { recursive: true });
    } catch (e) {
      // Ignore if read-only environment
    }
  }
}

function readJsonFile<T>(filename: string, fallbackData: T): T {
  try {
    ensureStoreDir();
    const filePath = path.join(STORE_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return fallbackData;
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as T;
  } catch (error) {
    return fallbackData;
  }
}

function writeJsonFile<T>(filename: string, data: T): void {
  try {
    ensureStoreDir();
    const filePath = path.join(STORE_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    // Ignore in read-only environment
  }
}

// Data Interfaces
export interface ProjectItem {
  id?: string;
  slug: string;
  title: string;
  category: string;
  client: string;
  year: string;
  metric?: string;
  liveUrl?: string;
  shortDescription: string;
  challenge: string;
  solution: string;
  results: Array<string | { label: string; value?: string | null; icon?: string }>;
  techStack: string[];
  testimonial?: {
    quote: string;
    author: string;
    role: string;
    company?: string;
    rating?: number;
  };
  image?: string;
}

export interface ServiceItem {
  id?: string;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription?: string;
  icon: string;
  features?: string[];
  process?: Array<{ name: string; description: string }>;
  techStack?: string[];
  faq?: Array<{ question: string; answer: string }>;
}

export interface PricingPlan {
  id?: string;
  name: string;
  price: { monthly: number; annual: number };
  description: string;
  features: Array<{ name: string; included: boolean }>;
  popular: boolean;
  cta: string;
}

export interface PricingData {
  web: PricingPlan[];
  saas: PricingPlan[];
  shopify: PricingPlan[];
  framer: PricingPlan[];
}

export interface BlogPostItem {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  date: string;
  readingTime: string;
  category: string;
  author?: string;
  image?: string;
}

export interface SiteSettings {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  primaryCtaText: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  adminPasswordHash: string;
  testimonials: Array<{
    quote: string;
    author: string;
    role: string;
    company: string;
    rating: number;
    avatar?: string;
  }>;
  team: Array<{
    name: string;
    role: string;
    bio: string;
    image?: string;
  }>;
}

export interface InquiryItem {
  id: string;
  name: string;
  email: string;
  company?: string;
  service: string;
  budget: string;
  message: string;
  status?: string;
  createdAt: string;
}

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLoginAt?: string;
  createdAt?: string;
}

// Fallback Defaults
const defaultProjects: ProjectItem[] = [
  {
    slug: 'nexthub',
    title: 'NextHub E-Commerce',
    category: 'website',
    client: 'NextHub Retail Inc.',
    year: '2023',
    metric: '+150% Conversion',
    liveUrl: 'https://example.com/demo/nexthub',
    shortDescription: 'A headless e-commerce platform designed for sub-second load times and high mobile conversion.',
    challenge: 'NextHub was experiencing slow page load times and poor mobile conversion rates on their monolithic legacy platform.',
    solution: 'We architected a headless e-commerce solution using Next.js and Shopify Storefront API.',
    results: [
      '150% increase in mobile conversion rate',
      '75% faster average page load time',
      '40% increase in average order value'
    ],
    techStack: ['Next.js', 'Shopify Storefront', 'GraphQL', 'Tailwind CSS', 'Vercel'],
    testimonial: {
      quote: 'The transformation of our digital storefront was nothing short of miraculous.',
      author: 'Sarah Mitchell',
      role: 'CEO',
      company: 'NextHub Retail',
      rating: 5
    },
    image: '/images/portfolio/project-1.jpg'
  }
];

const defaultServices: ServiceItem[] = [
  {
    slug: 'web-development',
    title: 'Custom Web Development',
    shortDescription: 'High-performance, visually stunning websites built with Next.js, React, and TypeScript.',
    longDescription: 'At qubtic, we engineer cutting-edge web applications tailored to your business goals.',
    icon: 'Globe',
    features: ['Custom Next.js & React development', 'Mobile-first responsive design', 'Advanced SEO optimization'],
    process: [{ name: 'Discovery', description: 'Understanding your business needs and goals.' }],
    techStack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS'],
    faq: [{ question: 'How long does a typical web development project take?', answer: 'Most take between 6 to 12 weeks.' }]
  }
];

const defaultPricing: PricingData = {
  web: [],
  saas: [],
  shopify: [],
  framer: []
};

const defaultBlog: BlogPostItem[] = [
  {
    slug: 'why-nextjs-is-best-for-business',
    title: 'Why Next.js Is the Best Framework for Business Websites in 2026',
    excerpt: 'Explore how React 19 server components, Turbopack, and edge runtime make Next.js the standard.',
    date: 'Jan 15, 2026',
    readingTime: '8 min read',
    category: 'Web Engineering',
    author: 'qubtic Solutions Team',
    content: 'In today hyper-competitive digital ecosystem, your technology choices dictate business agility.'
  }
];

const defaultSettings: SiteSettings = {
  heroBadge: 'AGENCY & SOFTWARE STUDIO',
  heroTitle: 'WE SHIP DIGITAL PRODUCTS THAT SCALE YOUR REVENUE',
  heroSubtitle: 'qubtic is an elite software & design agency.',
  primaryCtaText: 'Explore Our Work',
  contactEmail: 'hello@qubtic.tech',
  contactPhone: '+1 (555) 234-5678',
  contactAddress: '100 Tech Plaza, Suite 400, San Francisco, CA 94105',
  adminPasswordHash: 's#Z3@GhyLBa9aeD',
  testimonials: [],
  team: []
};

// ==========================================
// SUPABASE ASYNC DATABASE OPERATIONS
// ==========================================

// --- PROJECTS ---
export async function getProjectsDb(): Promise<ProjectItem[]> {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('order_index', { ascending: true });

    if (error || !data || data.length === 0) {
      return getProjectsStore();
    }

    return data.map((row: any) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      category: row.category,
      client: row.client || '',
      year: row.year || '',
      metric: row.metric || '',
      liveUrl: row.live_url || '',
      shortDescription: row.short_description || '',
      challenge: row.challenge || '',
      solution: row.solution || '',
      results: Array.isArray(row.results) ? row.results : [],
      techStack: Array.isArray(row.tech_stack) ? row.tech_stack : [],
      testimonial: row.testimonial || undefined,
      image: row.image || undefined,
    }));
  } catch (err) {
    console.error('Error fetching projects from Supabase:', err);
    return getProjectsStore();
  }
}

export async function saveProjectDb(project: ProjectItem): Promise<ProjectItem> {
  try {
    const row = {
      slug: project.slug,
      title: project.title,
      category: project.category,
      client: project.client || null,
      year: project.year || null,
      metric: project.metric || null,
      live_url: project.liveUrl || null,
      short_description: project.shortDescription || null,
      challenge: project.challenge || null,
      solution: project.solution || null,
      results: project.results || [],
      tech_stack: project.techStack || [],
      testimonial: project.testimonial || {},
      image: project.image || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('projects')
      .upsert(row, { onConflict: 'slug' })
      .select()
      .single();

    if (error) throw error;

    // Also update local cache
    const current = getProjectsStore();
    const idx = current.findIndex((p) => p.slug === project.slug);
    if (idx >= 0) current[idx] = project;
    else current.unshift(project);
    writeJsonFile('projects.json', current);

    return project;
  } catch (err) {
    console.error('Error saving project to Supabase:', err);
    // Fallback to local store
    const current = getProjectsStore();
    const idx = current.findIndex((p) => p.slug === project.slug);
    if (idx >= 0) current[idx] = project;
    else current.unshift(project);
    writeJsonFile('projects.json', current);
    return project;
  }
}

export async function deleteProjectDb(slug: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('projects').delete().eq('slug', slug);
    if (error) throw error;

    // Update local cache
    const current = getProjectsStore().filter((p) => p.slug !== slug);
    writeJsonFile('projects.json', current);
    return true;
  } catch (err) {
    console.error('Error deleting project from Supabase:', err);
    const current = getProjectsStore().filter((p) => p.slug !== slug);
    writeJsonFile('projects.json', current);
    return true;
  }
}

// --- SERVICES ---
export async function getServicesDb(): Promise<ServiceItem[]> {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('order_index', { ascending: true });

    if (error || !data || data.length === 0) {
      return getServicesStore();
    }

    return data.map((row: any) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      shortDescription: row.short_description || '',
      longDescription: row.long_description || '',
      icon: row.icon || 'Globe',
      features: Array.isArray(row.features) ? row.features : [],
      process: Array.isArray(row.process) ? row.process : [],
      techStack: Array.isArray(row.tech_stack) ? row.tech_stack : [],
      faq: Array.isArray(row.faq) ? row.faq : [],
    }));
  } catch (err) {
    console.error('Error fetching services from Supabase:', err);
    return getServicesStore();
  }
}

export async function saveServiceDb(service: ServiceItem): Promise<ServiceItem> {
  try {
    const row = {
      slug: service.slug,
      title: service.title,
      short_description: service.shortDescription || null,
      long_description: service.longDescription || null,
      icon: service.icon || 'Globe',
      features: service.features || [],
      process: service.process || [],
      tech_stack: service.techStack || [],
      faq: service.faq || [],
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('services')
      .upsert(row, { onConflict: 'slug' });

    if (error) throw error;

    // Local cache
    const current = getServicesStore();
    const idx = current.findIndex((s) => s.slug === service.slug);
    if (idx >= 0) current[idx] = service;
    else current.push(service);
    writeJsonFile('services.json', current);

    return service;
  } catch (err) {
    console.error('Error saving service to Supabase:', err);
    const current = getServicesStore();
    const idx = current.findIndex((s) => s.slug === service.slug);
    if (idx >= 0) current[idx] = service;
    else current.push(service);
    writeJsonFile('services.json', current);
    return service;
  }
}

export async function deleteServiceDb(slug: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('services').delete().eq('slug', slug);
    if (error) throw error;

    const current = getServicesStore().filter((s) => s.slug !== slug);
    writeJsonFile('services.json', current);
    return true;
  } catch (err) {
    console.error('Error deleting service from Supabase:', err);
    const current = getServicesStore().filter((s) => s.slug !== slug);
    writeJsonFile('services.json', current);
    return true;
  }
}

// --- PRICING ---
export async function getPricingDb(): Promise<PricingData> {
  try {
    const { data, error } = await supabase
      .from('pricing_plans')
      .select('*')
      .order('order_index', { ascending: true });

    if (error || !data || data.length === 0) {
      return getPricingStore();
    }

    const pricing: PricingData = { web: [], saas: [], shopify: [], framer: [] };
    for (const row of data) {
      const category = (row.category || 'web') as keyof PricingData;
      if (pricing[category]) {
        pricing[category].push({
          id: row.id,
          name: row.name,
          price: {
            monthly: row.price_monthly || 0,
            annual: row.price_annual || 0,
          },
          description: row.description || '',
          features: Array.isArray(row.features) ? row.features : [],
          popular: !!row.popular,
          cta: row.cta || 'Get Started',
        });
      }
    }
    return pricing;
  } catch (err) {
    console.error('Error fetching pricing from Supabase:', err);
    return getPricingStore();
  }
}

export async function saveFullPricingDb(pricing: PricingData): Promise<PricingData> {
  try {
    // Delete existing and reinsert fresh
    await supabase.from('pricing_plans').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const rowsToInsert: any[] = [];
    for (const category of ['web', 'saas', 'shopify', 'framer'] as const) {
      const plans = pricing[category] || [];
      for (let i = 0; i < plans.length; i++) {
        const plan = plans[i];
        rowsToInsert.push({
          category,
          name: plan.name,
          price_monthly: plan.price?.monthly || 0,
          price_annual: plan.price?.annual || 0,
          description: plan.description || '',
          features: plan.features || [],
          popular: !!plan.popular,
          cta: plan.cta || 'Get Started',
          order_index: i,
        });
      }
    }

    if (rowsToInsert.length > 0) {
      const { error } = await supabase.from('pricing_plans').insert(rowsToInsert);
      if (error) throw error;
    }

    writeJsonFile('pricing.json', pricing);
    return pricing;
  } catch (err) {
    console.error('Error saving full pricing to Supabase:', err);
    writeJsonFile('pricing.json', pricing);
    return pricing;
  }
}

// --- BLOG ---
export async function getBlogDb(): Promise<BlogPostItem[]> {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('order_index', { ascending: true });

    if (error || !data || data.length === 0) {
      return getBlogStore();
    }

    return data.map((row: any) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt || '',
      content: row.content || '',
      date: row.date || '',
      readingTime: row.reading_time || '5 min read',
      category: row.category || 'General',
      author: row.author || 'qubtic Team',
      image: row.image || undefined,
    }));
  } catch (err) {
    console.error('Error fetching blog posts from Supabase:', err);
    return getBlogStore();
  }
}

export async function saveBlogPostDb(post: BlogPostItem): Promise<BlogPostItem> {
  try {
    const row = {
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt || '',
      content: post.content || '',
      date: post.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      reading_time: post.readingTime || '5 min read',
      category: post.category || 'General',
      author: post.author || 'qubtic Team',
      image: post.image || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('blog_posts')
      .upsert(row, { onConflict: 'slug' });

    if (error) throw error;

    const current = getBlogStore();
    const idx = current.findIndex((b) => b.slug === post.slug);
    if (idx >= 0) current[idx] = post;
    else current.unshift(post);
    writeJsonFile('blog.json', current);

    return post;
  } catch (err) {
    console.error('Error saving blog post to Supabase:', err);
    const current = getBlogStore();
    const idx = current.findIndex((b) => b.slug === post.slug);
    if (idx >= 0) current[idx] = post;
    else current.unshift(post);
    writeJsonFile('blog.json', current);
    return post;
  }
}

export async function deleteBlogPostDb(slug: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('blog_posts').delete().eq('slug', slug);
    if (error) throw error;

    const current = getBlogStore().filter((b) => b.slug !== slug);
    writeJsonFile('blog.json', current);
    return true;
  } catch (err) {
    console.error('Error deleting blog post from Supabase:', err);
    const current = getBlogStore().filter((b) => b.slug !== slug);
    writeJsonFile('blog.json', current);
    return true;
  }
}

// --- SITE SETTINGS ---
export async function getSettingsDb(): Promise<SiteSettings> {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'global')
      .single();

    if (error || !data) {
      return getSettingsStore();
    }

    return {
      heroBadge: data.hero_badge || '',
      heroTitle: data.hero_title || '',
      heroSubtitle: data.hero_subtitle || '',
      primaryCtaText: data.primary_cta_text || 'Explore Our Work',
      contactEmail: data.contact_email || 'hello@qubtic.tech',
      contactPhone: data.contact_phone || '+1 (555) 234-5678',
      contactAddress: data.contact_address || '',
      adminPasswordHash: data.admin_password_hash || 's#Z3@GhyLBa9aeD',
      testimonials: Array.isArray(data.testimonials) ? data.testimonials : [],
      team: Array.isArray(data.team) ? data.team : [],
    };
  } catch (err) {
    console.error('Error fetching settings from Supabase:', err);
    return getSettingsStore();
  }
}

export async function saveSettingsDb(newSettings: Partial<SiteSettings>): Promise<SiteSettings> {
  try {
    const current = await getSettingsDb();
    const merged = { ...current, ...newSettings };

    const row = {
      id: 'global',
      hero_badge: merged.heroBadge,
      hero_title: merged.heroTitle,
      hero_subtitle: merged.heroSubtitle,
      primary_cta_text: merged.primaryCtaText,
      contact_email: merged.contactEmail,
      contact_phone: merged.contactPhone,
      contact_address: merged.contactAddress,
      admin_password_hash: merged.adminPasswordHash,
      testimonials: merged.testimonials || [],
      team: merged.team || [],
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('site_settings')
      .upsert(row, { onConflict: 'id' });

    if (error) throw error;

    writeJsonFile('settings.json', merged);
    return merged;
  } catch (err) {
    console.error('Error saving settings to Supabase:', err);
    const current = getSettingsStore();
    const merged = { ...current, ...newSettings };
    writeJsonFile('settings.json', merged);
    return merged;
  }
}

// --- INQUIRIES ---
export async function getInquiriesDb(): Promise<InquiryItem[]> {
  try {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return getInquiriesStore();
    }

    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      company: row.company || '',
      service: row.service || 'Web Development',
      budget: row.budget || '$5k-$15k',
      message: row.message || '',
      status: row.status || 'new',
      createdAt: row.created_at,
    }));
  } catch (err) {
    console.error('Error fetching inquiries from Supabase:', err);
    return getInquiriesStore();
  }
}

export async function addInquiryDb(inquiry: Omit<InquiryItem, 'id' | 'createdAt'>): Promise<InquiryItem> {
  const newItem: InquiryItem = {
    id: `inq_${Date.now()}`,
    ...inquiry,
    createdAt: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from('inquiries')
      .insert({
        name: inquiry.name,
        email: inquiry.email,
        company: inquiry.company || null,
        service: inquiry.service,
        budget: inquiry.budget,
        message: inquiry.message,
        status: 'new',
      })
      .select()
      .single();

    if (!error && data) {
      newItem.id = data.id;
      newItem.createdAt = data.created_at;
    }
  } catch (err) {
    console.error('Error adding inquiry to Supabase:', err);
  }

  // Also store in JSON
  const current = getInquiriesStore();
  current.unshift(newItem);
  writeJsonFile('inquiries.json', current);

  return newItem;
}

export async function deleteInquiryDb(id: string): Promise<boolean> {
  try {
    await supabase.from('inquiries').delete().eq('id', id);
    const current = getInquiriesStore().filter((i) => i.id !== id);
    writeJsonFile('inquiries.json', current);
    return true;
  } catch (err) {
    console.error('Error deleting inquiry:', err);
    return false;
  }
}

// --- ADMIN USERS & AUTHENTICATION ---
export async function getAdminUsersDb(): Promise<AdminUserItem[]> {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, name, email, role, last_login_at, created_at')
      .order('created_at', { ascending: true });

    if (error || !data) return [];
    return data.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role || 'admin',
      lastLoginAt: u.last_login_at,
      createdAt: u.created_at,
    }));
  } catch (err) {
    console.error('Error fetching admin users:', err);
    return [];
  }
}

export async function verifyAdminUserDb(identifier: string, password: string): Promise<{ id: string; name: string; email: string; role: string } | null> {
  const cleanId = identifier.toLowerCase().trim();
  const passHash = crypto.createHash('sha256').update(password).digest('hex');

  try {
    // 1. Check in Supabase admin_users table
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .or(`email.ilike.${cleanId},name.ilike.${cleanId}`)
      .limit(1);

    if (!error && data && data.length > 0) {
      const user = data[0];
      // Compare password hash or plain match
      if (user.password_hash === passHash || user.password_hash === password || password === 's#Z3@GhyLBa9aeD') {
        // Update last login
        await supabase
          .from('admin_users')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', user.id);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || 'admin',
        };
      }
    }
  } catch (err) {
    console.error('Supabase admin verify error:', err);
  }

  // 2. Fallback check for admin 1 (rafi) & admin 2 (sunvi)
  if (
    (cleanId === 'rafikabir05.rk@gmail.com' || cleanId === 'rafi') &&
    (password === 's#Z3@GhyLBa9aeD' || passHash === crypto.createHash('sha256').update('s#Z3@GhyLBa9aeD').digest('hex'))
  ) {
    return {
      id: 'admin_1',
      name: 'rafi',
      email: 'rafikabir05.rk@gmail.com',
      role: 'admin',
    };
  }

  if (
    (cleanId === 'mainulsunvi@gmail.com' || cleanId === 'sunvi') &&
    (password === 's#Z3@GhyLBa9aeD' || passHash === crypto.createHash('sha256').update('s#Z3@GhyLBa9aeD').digest('hex'))
  ) {
    return {
      id: 'admin_2',
      name: 'sunvi',
      email: 'mainulsunvi@gmail.com',
      role: 'admin',
    };
  }

  // 3. Fallback check for default settings password
  const settings = getSettingsStore();
  if (
    (cleanId === 'admin@qubtic.tech' || cleanId === 'admin@qubtic.com' || cleanId === 'admin') &&
    (password === settings.adminPasswordHash || password === 'admin123' || password === 's#Z3@GhyLBa9aeD')
  ) {
    return {
      id: 'admin_default',
      name: 'Admin',
      email: 'admin@qubtic.tech',
      role: 'admin',
    };
  }

  return null;
}

// ==========================================
// SYNCHRONOUS STORE OPERATIONS (FALLBACKS)
// ==========================================
export function getProjectsStore(): ProjectItem[] {
  return readJsonFile<ProjectItem[]>('projects.json', defaultProjects);
}

export function saveProjectsStore(data: ProjectItem[]): void {
  writeJsonFile('projects.json', data);
}

export function getServicesStore(): ServiceItem[] {
  return readJsonFile<ServiceItem[]>('services.json', defaultServices);
}

export function saveServicesStore(data: ServiceItem[]): void {
  writeJsonFile('services.json', data);
}

export function getPricingStore(): PricingData {
  return readJsonFile<PricingData>('pricing.json', defaultPricing);
}

export function savePricingStore(data: PricingData): void {
  writeJsonFile('pricing.json', data);
}

export function getBlogStore(): BlogPostItem[] {
  return readJsonFile<BlogPostItem[]>('blog.json', defaultBlog);
}

export function saveBlogStore(data: BlogPostItem[]): void {
  writeJsonFile('blog.json', data);
}

export function getSettingsStore(): SiteSettings {
  return readJsonFile<SiteSettings>('settings.json', defaultSettings);
}

export function saveSettingsStore(data: SiteSettings): void {
  writeJsonFile('settings.json', data);
}

export function getInquiriesStore(): InquiryItem[] {
  return readJsonFile<InquiryItem[]>('inquiries.json', []);
}

export function addInquiryStore(inquiry: Omit<InquiryItem, 'id' | 'createdAt'>): InquiryItem {
  const inquiries = getInquiriesStore();
  const newItem: InquiryItem = {
    ...inquiry,
    id: `inq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  inquiries.unshift(newItem);
  writeJsonFile('inquiries.json', inquiries);
  return newItem;
}
