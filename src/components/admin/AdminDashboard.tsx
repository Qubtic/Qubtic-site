'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  LayoutDashboard,
  Briefcase,
  Layers,
  Tag,
  FileText,
  Sliders,
  LogOut,
  ExternalLink,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  RefreshCw,
  Save,
  ShieldAlert,
  Sparkles,
  FolderOpen,
  ChevronRight,
  Globe,
  Code2,
  Zap,
  Inbox,
  Users,
  Mail,
} from 'lucide-react';
import { ProjectItem, ServiceItem, PricingData, PricingPlan, BlogPostItem, SiteSettings, InquiryItem, AdminUserItem } from '@/lib/store';
import { CloudinaryUploader } from './CloudinaryUploader';
import { MediaLibraryModal } from './MediaLibraryModal';
import { MarkdownEditor } from './MarkdownEditor';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { TechLoader } from '@/components/ui/TechLoader';

const PROJECT_CATEGORY_OPTIONS = [
  { value: 'website', label: 'Web Development (website)', description: 'Custom Next.js & React Applications' },
  { value: 'saas', label: 'SaaS Product (saas)', description: 'Cloud Software & Platforms' },
  { value: 'shopify', label: 'Shopify App (shopify)', description: 'E-commerce Apps & Custom Storefronts' },
  { value: 'framer', label: 'Framer Website (framer)', description: 'Interactive Framer Websites & CMS' },
];

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'services' | 'pricing' | 'blog' | 'inquiries' | 'media' | 'settings'>('overview');

  // Data States
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [pricing, setPricing] = useState<PricingData>({ web: [], saas: [], shopify: [], framer: [] });
  const [blogPosts, setBlogPosts] = useState<BlogPostItem[]>([]);
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUserItem[]>([]);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role?: string } | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // Status & Feedback
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal / Form States
  const [editingProject, setEditingProject] = useState<Partial<ProjectItem> | null>(null);
  const [isCustomCategoryInput, setIsCustomCategoryInput] = useState(false);
  const [editingService, setEditingService] = useState<Partial<ServiceItem> | null>(null);
  const [editingPricingCategory, setEditingPricingCategory] = useState<'web' | 'saas' | 'shopify' | 'framer'>('web');
  const [editingPricingPlan, setEditingPricingPlan] = useState<{ plan: Partial<PricingPlan>; index: number } | null>(null);
  const [editingBlogPost, setEditingBlogPost] = useState<Partial<BlogPostItem> | null>(null);

  // Load All Store Data
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [projRes, servRes, priceRes, blogRes, inqRes, authRes, usersRes, setRes] = await Promise.all([
        fetch('/api/admin/projects'),
        fetch('/api/admin/services'),
        fetch('/api/admin/pricing'),
        fetch('/api/admin/blog'),
        fetch('/api/admin/inquiries'),
        fetch('/api/auth/check'),
        fetch('/api/admin/users'),
        fetch('/api/admin/settings'),
      ]);

      if (projRes.ok) setProjects(await projRes.json());
      if (servRes.ok) setServices(await servRes.json());
      if (priceRes.ok) setPricing(await priceRes.json());
      if (blogRes.ok) setBlogPosts(await blogRes.json());
      if (inqRes.ok) setInquiries(await inqRes.json());
      if (authRes.ok) {
        const authData = await authRes.json();
        if (authData.user) setCurrentUser(authData.user);
      }
      if (usersRes.ok) setAdminUsers(await usersRes.json());
      if (setRes.ok) setSettings(await setRes.json());
    } catch (err) {
      showFeedback('error', 'Failed to sync live database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // --- PROJECT ACTIONS ---
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject?.title || !editingProject?.slug) return;

    try {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'website',
          client: 'Client Name',
          year: '2026',
          shortDescription: '',
          challenge: '',
          solution: '',
          techStack: ['Next.js', 'React'],
          ...editingProject,
        }),
      });

      if (res.ok) {
        showFeedback('success', 'Project case study saved live!');
        setEditingProject(null);
        fetchAllData();
      }
    } catch (err) {
      showFeedback('error', 'Failed to save project');
    }
  };

  const handleDeleteProject = async (slug: string) => {
    if (!confirm(`Are you sure you want to delete project "${slug}"?`)) return;
    try {
      const res = await fetch('/api/admin/projects', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      if (res.ok) {
        showFeedback('success', 'Project deleted');
        fetchAllData();
      }
    } catch (err) {
      showFeedback('error', 'Failed to delete project');
    }
  };

  // --- SERVICE ACTIONS ---
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService?.title || !editingService?.slug) return;

    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          icon: 'Globe',
          shortDescription: '',
          longDescription: '',
          features: [],
          ...editingService,
        }),
      });

      if (res.ok) {
        showFeedback('success', 'Service capability updated!');
        setEditingService(null);
        fetchAllData();
      }
    } catch (err) {
      showFeedback('error', 'Failed to save service');
    }
  };

  const handleDeleteService = async (slug: string) => {
    if (!confirm(`Delete service offering "${slug}"?`)) return;
    try {
      const res = await fetch('/api/admin/services', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      if (res.ok) {
        showFeedback('success', 'Service deleted');
        fetchAllData();
      }
    } catch (err) {
      showFeedback('error', 'Failed to delete service');
    }
  };

  // --- PRICING ACTIONS ---
  const handleSavePricingPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPricingPlan) return;

    const categoryPlans = [...(pricing[editingPricingCategory] || [])];
    if (editingPricingPlan.index >= 0) {
      categoryPlans[editingPricingPlan.index] = editingPricingPlan.plan as PricingPlan;
    } else {
      categoryPlans.push(editingPricingPlan.plan as PricingPlan);
    }

    const updatedPricing = { ...pricing, [editingPricingCategory]: categoryPlans };

    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPricing),
      });

      if (res.ok) {
        showFeedback('success', 'Pricing plans saved!');
        setEditingPricingPlan(null);
        fetchAllData();
      }
    } catch (err) {
      showFeedback('error', 'Failed to save pricing plan');
    }
  };

  const handleDeletePricingPlan = async (category: keyof PricingData, index: number) => {
    if (!confirm('Delete this pricing plan?')) return;
    const categoryPlans = [...(pricing[category] || [])];
    categoryPlans.splice(index, 1);
    const updatedPricing = { ...pricing, [category]: categoryPlans };

    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPricing),
      });
      if (res.ok) {
        showFeedback('success', 'Pricing plan deleted');
        fetchAllData();
      }
    } catch (err) {
      showFeedback('error', 'Failed to delete pricing plan');
    }
  };

  // --- BLOG POST ACTIONS ---
  const handleSaveBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlogPost?.title || !editingBlogPost?.slug) return;

    try {
      const res = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'Engineering',
          readingTime: '5 min read',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          excerpt: '',
          content: '',
          ...editingBlogPost,
        }),
      });

      if (res.ok) {
        showFeedback('success', 'Blog article published!');
        setEditingBlogPost(null);
        fetchAllData();
      }
    } catch (err) {
      showFeedback('error', 'Failed to save blog post');
    }
  };

  const handleDeleteBlogPost = async (slug: string) => {
    if (!confirm(`Are you sure you want to delete blog post "${slug}"?`)) return;
    try {
      const res = await fetch('/api/admin/blog', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      if (res.ok) {
        showFeedback('success', 'Blog post deleted');
        fetchAllData();
      }
    } catch (err) {
      showFeedback('error', 'Failed to delete blog post');
    }
  };

  // --- INQUIRY ACTIONS ---
  const handleDeleteInquiry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client inquiry?')) return;
    try {
      const res = await fetch('/api/admin/inquiries', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        showFeedback('success', 'Inquiry deleted');
        fetchAllData();
      }
    } catch (err) {
      showFeedback('error', 'Failed to delete inquiry');
    }
  };

  // --- SITE SETTINGS ACTIONS ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        showFeedback('success', 'Site settings & customizations saved live to Supabase!');
        fetchAllData();
      }
    } catch (err) {
      showFeedback('error', 'Failed to save settings');
    }
  };

  const navTabs = [
    { id: 'overview', label: 'Overview & Stats', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects Manager', icon: Briefcase, count: projects.length },
    { id: 'services', label: 'Services Manager', icon: Layers, count: services.length },
    { id: 'pricing', label: 'Pricing Plans', icon: Tag },
    { id: 'blog', label: 'Blog & Articles', icon: FileText, count: blogPosts.length },
    { id: 'inquiries', label: 'Client Inquiries', icon: Inbox, count: inquiries.length },
    { id: 'media', label: 'Cloudinary Media', icon: FolderOpen },
    { id: 'settings', label: 'Full Site Customizer', icon: Sliders },
  ];

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#141915] flex flex-col md:flex-row antialiased">
      {/* Top Notification Toast */}
      {feedback && (
        <div
          className={`fixed top-6 right-6 z-[99999] px-5 py-3.5 rounded-2xl shadow-2xl border text-xs font-bold uppercase tracking-wider flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ${
            feedback.type === 'success'
              ? 'bg-[#0C3823] text-white border-[#CCFF00]/40'
              : 'bg-red-600 text-white border-red-400'
          }`}
        >
          {feedback.type === 'success' ? <Check className="w-4 h-4 text-[#CCFF00]" /> : <ShieldAlert className="w-4 h-4" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* LEFT FIXED SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-72 bg-[#0E3825] text-white flex flex-col justify-between p-5 md:h-screen md:sticky md:top-0 border-r border-[#164E33]/40 shrink-0 z-40">
        <div className="space-y-6">
          {/* Studio Brand Header */}
          <div className="flex items-center justify-between px-2 pt-2">
            <div className="relative h-10 w-36 overflow-hidden">
              <Image
                src="/images/brand/qubtic-white.png"
                alt="Qubtic"
                width={1608}
                height={978}
                priority
                className="h-[84px] w-36 max-w-none -translate-y-[22px] object-contain"
              />
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-bold uppercase text-[#CCFF00]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#CCFF00] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#CCFF00]"></span>
              </span>
              <span>Live DB</span>
            </div>
          </div>

          <div className="h-px bg-white/10" />

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                    isActive
                      ? 'bg-[#CCFF00] text-[#0E3825] shadow-md font-extrabold translate-x-1'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#0E3825]' : 'text-white/60'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {typeof tab.count === 'number' && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        isActive ? 'bg-[#0E3825]/20 text-[#0E3825]' : 'bg-white/15 text-white'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer User Info & Quick Actions */}
        <div className="pt-6 mt-6 border-t border-white/10 space-y-3">
          <div className="px-3 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs">
            <p className="text-[10px] uppercase font-semibold text-white/45">Authenticated Admin</p>
            <p className="font-bold text-white truncate capitalize">{currentUser?.name || 'Admin'}</p>
            <p className="text-[11px] text-[#CCFF00] truncate">{currentUser?.email || 'admin@qubtic.tech'}</p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex-1 px-3 py-2.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/15 text-white text-[11px] font-bold uppercase tracking-wider transition-all inline-flex items-center justify-center gap-1.5"
            >
              <span>Preview Site</span>
              <ExternalLink className="w-3 h-3 text-[#CCFF00]" />
            </a>
            <button
              onClick={onLogout}
              className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:bg-rose-500 hover:text-white transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE CONTENT AREA (FULL WIDTH) */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-[#E5E0D8] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-30 shadow-2xs">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-tight text-[#141915] font-heading flex items-center gap-2">
              <span>{navTabs.find((t) => t.id === activeTab)?.label}</span>
            </h2>
            <p className="text-xs text-[#666C64] mt-0.5">
              Live Qubtic Studio CMS · Changes publish instantly to the production site
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAllData}
              className="px-3.5 py-2 rounded-xl border border-[#E5E0D8] text-[#141915] hover:bg-[#F0EDE5] transition-colors text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
              title="Refresh Data"
            >
              {loading ? (
                <TechLoader size="inline" text="Syncing" />
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-[#0C3823]" />
                  <span>Sync</span>
                </>
              )}
            </button>

            {activeTab === 'projects' && (
              <button
                onClick={() => {
                  setIsCustomCategoryInput(false);
                  setEditingProject({
                    title: '',
                    slug: '',
                    category: 'website',
                    client: '',
                    year: '2026',
                    metric: '',
                    shortDescription: '',
                    challenge: '',
                    solution: '',
                    techStack: ['Next.js', 'React'],
                  });
                }}
                className="px-4 py-2 rounded-xl bg-[#0C3823] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#164E33] transition-all inline-flex items-center gap-2 shadow-xs"
              >
                <Plus className="w-4 h-4 text-[#CCFF00]" />
                <span>Add Project</span>
              </button>
            )}

            {activeTab === 'services' && (
              <button
                onClick={() =>
                  setEditingService({
                    title: '',
                    slug: '',
                    icon: 'Globe',
                    shortDescription: '',
                    longDescription: '',
                    features: ['Expressive Web Design', 'Responsive UI', 'SEO Optimization'],
                  })
                }
                className="px-4 py-2 rounded-xl bg-[#0C3823] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#164E33] transition-all inline-flex items-center gap-2 shadow-xs"
              >
                <Plus className="w-4 h-4 text-[#CCFF00]" />
                <span>Add Service</span>
              </button>
            )}

            {activeTab === 'blog' && (
              <button
                onClick={() =>
                  setEditingBlogPost({
                    title: '',
                    slug: '',
                    excerpt: '',
                    content: '',
                    category: 'Web Engineering',
                    readingTime: '5 min read',
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                  })
                }
                className="px-4 py-2 rounded-xl bg-[#0C3823] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#164E33] transition-all inline-flex items-center gap-2 shadow-xs"
              >
                <Plus className="w-4 h-4 text-[#CCFF00]" />
                <span>Create Article</span>
              </button>
            )}
          </div>
        </header>

        {/* WORKSPACE BODY */}
        <div className="p-6 lg:p-8 space-y-8 flex-1">
          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stat Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div
                  onClick={() => setActiveTab('projects')}
                  className="bg-white border border-[#E5E0D8] rounded-[28px] p-6 shadow-xs hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#666C64]">Projects</span>
                    <div className="p-2.5 rounded-2xl bg-[#0C3823]/10 text-[#0C3823] group-hover:bg-[#0C3823] group-hover:text-[#CCFF00] transition-colors">
                      <Briefcase className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-4xl font-black font-heading text-[#141915]">{projects.length}</div>
                  <p className="text-xs text-[#666C64] mt-1 font-medium">Active portfolio case studies</p>
                </div>

                <div
                  onClick={() => setActiveTab('services')}
                  className="bg-white border border-[#E5E0D8] rounded-[28px] p-6 shadow-xs hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#666C64]">Services</span>
                    <div className="p-2.5 rounded-2xl bg-[#0C3823]/10 text-[#0C3823] group-hover:bg-[#0C3823] group-hover:text-[#CCFF00] transition-colors">
                      <Layers className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-4xl font-black font-heading text-[#141915]">{services.length}</div>
                  <p className="text-xs text-[#666C64] mt-1 font-medium">Offered capabilities</p>
                </div>

                <div
                  onClick={() => setActiveTab('pricing')}
                  className="bg-white border border-[#E5E0D8] rounded-[28px] p-6 shadow-xs hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#666C64]">Pricing Tiers</span>
                    <div className="p-2.5 rounded-2xl bg-[#0C3823]/10 text-[#0C3823] group-hover:bg-[#0C3823] group-hover:text-[#CCFF00] transition-colors">
                      <Tag className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-4xl font-black font-heading text-[#141915]">
                    {Object.values(pricing).reduce((acc, curr) => acc + curr.length, 0)}
                  </div>
                  <p className="text-xs text-[#666C64] mt-1 font-medium">Across 4 service tiers</p>
                </div>

                <div
                  onClick={() => setActiveTab('blog')}
                  className="bg-white border border-[#E5E0D8] rounded-[28px] p-6 shadow-xs hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#666C64]">Blog Articles</span>
                    <div className="p-2.5 rounded-2xl bg-[#0C3823]/10 text-[#0C3823] group-hover:bg-[#0C3823] group-hover:text-[#CCFF00] transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-4xl font-black font-heading text-[#141915]">{blogPosts.length}</div>
                  <p className="text-xs text-[#666C64] mt-1 font-medium">Published insights</p>
                </div>
              </div>

              {/* Banner */}
              <div className="bg-[#0C3823] text-white rounded-[32px] p-8 shadow-md relative overflow-hidden">
                <Sparkles className="w-24 h-24 absolute -right-4 -bottom-4 text-[#CCFF00]/10 pointer-events-none" />
                <div className="max-w-2xl space-y-4">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-[11px] font-semibold uppercase tracking-wider text-[#CCFF00]">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Studio Control Panel</span>
                  </div>
                  <h2 className="text-3xl font-bold font-heading tracking-tight leading-tight">
                    Full Live Customization & Markdown System Enabled
                  </h2>
                  <p className="text-xs text-white/75 leading-relaxed">
                    Manage portfolio case studies, edit services, update pricing tables, write blog posts with live Markdown preview, and manage Cloudinary media assets seamlessly.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-3">
                    <button
                      onClick={() => setActiveTab('projects')}
                      className="px-5 py-3 rounded-xl bg-[#CCFF00] text-[#0C3823] text-xs font-bold uppercase tracking-wider hover:bg-white transition-all shadow-sm"
                    >
                      + Add New Project
                    </button>
                    <button
                      onClick={() => setActiveTab('blog')}
                      className="px-5 py-3 rounded-xl border border-white/30 bg-white/10 text-white text-xs font-bold uppercase tracking-wider hover:bg-white/20 transition-all"
                    >
                      Write Markdown Article
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. PROJECTS MANAGER TAB */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              {editingProject && (
                <form onSubmit={handleSaveProject} className="bg-white border-2 border-[#0C3823] rounded-[28px] p-6 lg:p-8 space-y-6 shadow-lg">
                  <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-4">
                    <h3 className="font-bold text-base uppercase text-[#0C3823] font-heading flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-[#0C3823]" />
                      <span>{editingProject.slug ? 'Edit Case Study' : 'Create New Project'}</span>
                    </h3>
                    <button type="button" onClick={() => setEditingProject(null)} className="p-2 rounded-xl hover:bg-[#F0EDE5] text-[#666C64]">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1.5 text-[#141915]">Project Title</label>
                      <input
                        type="text"
                        required
                        value={editingProject.title || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                        className="w-full px-4 py-3 border border-[#E5E0D8] bg-[#FDFBF7] rounded-2xl text-xs text-[#141915]"
                        placeholder="e.g. NextHub E-Commerce"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1.5 text-[#141915]">URL Slug</label>
                      <input
                        type="text"
                        required
                        value={editingProject.slug || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, slug: e.target.value })}
                        className="w-full px-4 py-3 border border-[#E5E0D8] bg-[#FDFBF7] rounded-2xl text-xs text-[#141915]"
                        placeholder="e.g. nexthub"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#141915]">Category</label>
                        <button
                          type="button"
                          onClick={() => {
                            const nextState = !isCustomCategoryInput;
                            setIsCustomCategoryInput(nextState);
                            if (nextState) {
                              setEditingProject({ ...editingProject, category: '' });
                            } else {
                              setEditingProject({ ...editingProject, category: 'website' });
                            }
                          }}
                          className="text-[10px] text-[#0C3823] hover:underline font-extrabold uppercase tracking-wider"
                        >
                          {isCustomCategoryInput ? '← Select Preset' : '+ Custom Category'}
                        </button>
                      </div>

                      {isCustomCategoryInput ? (
                        <input
                          type="text"
                          required
                          value={editingProject.category || ''}
                          onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                          placeholder="e.g. Mobile App or AI Agent"
                          className="w-full px-4 py-3 border-2 border-[#0C3823] bg-[#FDFBF7] rounded-xl text-xs font-semibold text-[#141915] focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <CustomSelect
                          options={[
                            ...PROJECT_CATEGORY_OPTIONS,
                            ...projects
                              .map((p) => p.category)
                              .filter((cat) => cat && !PROJECT_CATEGORY_OPTIONS.some((opt) => opt.value === cat))
                              .filter((v, i, a) => a.indexOf(v) === i)
                              .map((cat) => ({
                                value: cat,
                                label: `${cat} (Custom)`,
                                description: `Existing custom category "${cat}"`,
                              })),
                          ]}
                          value={editingProject.category || 'website'}
                          onChange={(val) => setEditingProject({ ...editingProject, category: val })}
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1.5 text-[#141915]">Client Name</label>
                      <input
                        type="text"
                        value={editingProject.client || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, client: e.target.value })}
                        className="w-full px-4 py-3 border border-[#E5E0D8] bg-[#FDFBF7] rounded-2xl text-xs text-[#141915]"
                        placeholder="e.g. NextHub Retail Inc."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1.5 text-[#141915]">Year</label>
                      <input
                        type="text"
                        value={editingProject.year || '2026'}
                        onChange={(e) => setEditingProject({ ...editingProject, year: e.target.value })}
                        className="w-full px-4 py-3 border border-[#E5E0D8] bg-[#FDFBF7] rounded-2xl text-xs text-[#141915]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1.5 text-[#141915]">Key Metric Badge</label>
                      <input
                        type="text"
                        value={editingProject.metric || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, metric: e.target.value })}
                        className="w-full px-4 py-3 border border-[#E5E0D8] bg-[#FDFBF7] rounded-2xl text-xs text-[#141915]"
                        placeholder="e.g. +150% Conversion"
                      />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3">
                      <label className="block text-xs font-bold uppercase mb-1.5 text-[#141915]">
                        Live Demo / Preview Link (Optional)
                      </label>
                      <div className="relative">
                        <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#666C64] pointer-events-none" />
                        <input
                          type="url"
                          value={editingProject.liveUrl || ''}
                          onChange={(e) => setEditingProject({ ...editingProject, liveUrl: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-[#E5E0D8] bg-[#FDFBF7] rounded-2xl text-xs text-[#141915] placeholder:text-[#666C64]"
                          placeholder="e.g. https://pixelstudio.agency or https://demo.app"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase mb-1.5 text-[#141915]">Short Description / Summary</label>
                    <textarea
                      rows={2}
                      value={editingProject.shortDescription || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, shortDescription: e.target.value })}
                      className="w-full px-4 py-3 border border-[#E5E0D8] bg-[#FDFBF7] rounded-2xl text-xs text-[#141915]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase mb-1.5 text-[#141915]">Challenge</label>
                    <textarea
                      rows={2}
                      value={editingProject.challenge || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, challenge: e.target.value })}
                      className="w-full px-4 py-3 border border-[#E5E0D8] bg-[#FDFBF7] rounded-2xl text-xs text-[#141915]"
                    />
                  </div>

                  <div>
                    <MarkdownEditor
                      value={editingProject.solution || ''}
                      onChange={(val) => setEditingProject({ ...editingProject, solution: val })}
                      label="Project Case Study Solution (Markdown Supported with Live Preview)"
                      placeholder="Detail the technical architecture, design system, and solution built..."
                      minHeight="min-h-[480px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase mb-1.5 text-[#141915]">Tech Stack (comma separated)</label>
                    <input
                      type="text"
                      value={Array.isArray(editingProject.techStack) ? editingProject.techStack.join(', ') : ''}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          techStack: e.target.value.split(',').map((s) => s.trim()),
                        })
                      }
                      className="w-full px-4 py-3 border border-[#E5E0D8] bg-[#FDFBF7] rounded-2xl text-xs text-[#141915]"
                      placeholder="Next.js, TypeScript, Tailwind CSS"
                    />
                  </div>

                  <CloudinaryUploader
                    value={editingProject.image || ''}
                    onChange={(val) => setEditingProject({ ...editingProject, image: val })}
                    label="Project Cover Image (Cloudinary CldImage)"
                    folder="qubtic_projects"
                  />

                  <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E0D8]">
                    <button type="button" onClick={() => setEditingProject(null)} className="px-5 py-2.5 border border-[#E5E0D8] bg-[#F8F6F0] rounded-xl text-xs font-bold uppercase hover:bg-[#E5E0D8]">
                      Cancel
                    </button>
                    <button type="submit" className="px-6 py-2.5 bg-[#0C3823] text-white rounded-xl text-xs font-bold uppercase inline-flex items-center gap-2 hover:bg-[#164E33] shadow-xs">
                      <Save className="w-4 h-4 text-[#CCFF00]" />
                      <span>Save Project</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((proj) => (
                  <div
                    key={proj.slug}
                    className="group bg-white border border-[#E5E0D8] rounded-[28px] p-6 shadow-sm flex flex-col justify-between hover:border-[#0C3823] hover:shadow-lg transition-all duration-300"
                  >
                    <div>
                      {/* Top Header with Badges & Distinct Action Buttons */}
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-3 py-1 bg-[#0C3823] text-[#CCFF00] rounded-full text-[10px] font-mono font-bold uppercase tracking-wider shadow-2xs">
                            {proj.category}
                          </span>
                          <span className="px-2.5 py-1 bg-[#F0EDE5] border border-[#E5E0D8] text-[#141915] rounded-full text-[10px] font-mono font-semibold">
                            {proj.year}
                          </span>
                        </div>

                        {/* Distinct High-Contrast Action Buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              const isCustom =
                                proj.category &&
                                !PROJECT_CATEGORY_OPTIONS.some((opt) => opt.value === proj.category);
                              setIsCustomCategoryInput(!!isCustom);
                              setEditingProject(proj);
                            }}
                            className="h-8 w-8 rounded-xl bg-[#F0EDE5] text-[#0C3823] hover:bg-[#0C3823] hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs"
                            title="Edit Project"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(proj.slug)}
                            className="h-8 w-8 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs"
                            title="Delete Project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Project Title & Metric */}
                      <div className="space-y-1.5 mb-2.5">
                        <h3 className="text-lg font-bold text-[#141915] font-heading group-hover:text-[#0C3823] transition-colors line-clamp-1">
                          {proj.title}
                        </h3>
                        {proj.metric && (
                          <span className="inline-block text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                            ★ {proj.metric}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#666C64] leading-relaxed line-clamp-2 mb-4">
                        {proj.shortDescription}
                      </p>
                    </div>

                    {/* Footer Info & Action Links */}
                    <div className="pt-4 border-t border-[#E5E0D8] flex items-center justify-between gap-2 text-xs">
                      <span className="text-[11px] text-[#666C64] truncate max-w-[130px]">
                        Client: <strong className="text-[#141915]">{proj.client}</strong>
                      </span>

                      <div className="flex items-center gap-2 shrink-0">
                        {proj.liveUrl && (
                          <a
                            href={proj.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all shadow-2xs"
                            title="Open Live Demo"
                          >
                            <Globe className="w-3.5 h-3.5 text-emerald-600 group-hover:text-white" />
                            <span>Live</span>
                          </a>
                        )}
                        <a
                          href={`/portfolio/${proj.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F0EDE5] border border-[#E5E0D8] text-[#0C3823] text-[11px] font-bold hover:bg-[#0C3823] hover:text-white hover:border-[#0C3823] transition-all shadow-2xs"
                          title="View Case Study"
                        >
                          <span>View</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. SERVICES MANAGER TAB */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              {editingService && (
                <form onSubmit={handleSaveService} className="bg-white border-2 border-[#0C3823] rounded-[28px] p-6 lg:p-8 space-y-5 shadow-lg">
                  <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-4">
                    <h3 className="font-bold text-base uppercase text-[#0C3823] font-heading flex items-center gap-2">
                      <Layers className="w-5 h-5 text-[#0C3823]" />
                      <span>{editingService.slug ? 'Edit Service' : 'Add New Service'}</span>
                    </h3>
                    <button type="button" onClick={() => setEditingService(null)} className="p-2 rounded-xl hover:bg-[#F0EDE5] text-[#666C64]">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1.5 text-[#141915]">Service Title</label>
                      <input
                        type="text"
                        required
                        value={editingService.title || ''}
                        onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                        className="w-full px-4 py-3 border border-[#E5E0D8] bg-[#FDFBF7] rounded-2xl text-xs text-[#141915]"
                        placeholder="e.g. Web Development"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1.5 text-[#141915]">Slug</label>
                      <input
                        type="text"
                        required
                        value={editingService.slug || ''}
                        onChange={(e) => setEditingService({ ...editingService, slug: e.target.value })}
                        className="w-full px-4 py-3 border border-[#E5E0D8] bg-[#FDFBF7] rounded-2xl text-xs text-[#141915]"
                        placeholder="e.g. web-development"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1.5 text-[#141915]">Icon Name (Lucide)</label>
                      <input
                        type="text"
                        value={editingService.icon || 'Globe'}
                        onChange={(e) => setEditingService({ ...editingService, icon: e.target.value })}
                        className="w-full px-4 py-3 border border-[#E5E0D8] bg-[#FDFBF7] rounded-2xl text-xs text-[#141915]"
                        placeholder="Globe, Code, Layers"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase mb-1.5 text-[#141915]">Short Description</label>
                    <textarea
                      rows={2}
                      value={editingService.shortDescription || ''}
                      onChange={(e) => setEditingService({ ...editingService, shortDescription: e.target.value })}
                      className="w-full px-4 py-3 border border-[#E5E0D8] bg-[#FDFBF7] rounded-2xl text-xs text-[#141915]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase mb-1.5 text-[#141915]">Long Description</label>
                    <textarea
                      rows={3}
                      value={editingService.longDescription || ''}
                      onChange={(e) => setEditingService({ ...editingService, longDescription: e.target.value })}
                      className="w-full px-4 py-3 border border-[#E5E0D8] bg-[#FDFBF7] rounded-2xl text-xs text-[#141915]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase mb-1.5 text-[#141915]">Features List (one feature per line)</label>
                    <textarea
                      rows={4}
                      value={Array.isArray(editingService.features) ? editingService.features.join('\n') : ''}
                      onChange={(e) =>
                        setEditingService({
                          ...editingService,
                          features: e.target.value.split('\n').filter(Boolean),
                        })
                      }
                      className="w-full px-4 py-3 border border-[#E5E0D8] bg-[#FDFBF7] rounded-2xl text-xs text-[#141915] font-mono"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E0D8]">
                    <button type="button" onClick={() => setEditingService(null)} className="px-5 py-2.5 border border-[#E5E0D8] bg-[#F8F6F0] rounded-xl text-xs font-bold uppercase hover:bg-[#E5E0D8]">
                      Cancel
                    </button>
                    <button type="submit" className="px-6 py-2.5 bg-[#0C3823] text-white rounded-xl text-xs font-bold uppercase inline-flex items-center gap-2 hover:bg-[#164E33] shadow-xs">
                      <Save className="w-4 h-4 text-[#CCFF00]" />
                      <span>Save Service</span>
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((serv) => (
                  <div key={serv.slug} className="bg-white border border-[#E5E0D8] rounded-[28px] p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-3 py-1 bg-[#F0EDE5] text-[#0C3823] rounded-full text-xs font-bold uppercase">
                          Icon: {serv.icon}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setEditingService(serv)} className="p-2 text-[#0C3823] hover:bg-[#F0EDE5] rounded-xl" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteService(serv.slug)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-[#141915] font-heading">{serv.title}</h3>
                      <p className="text-xs text-[#666C64] mt-2 leading-relaxed">{serv.shortDescription}</p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-[#E5E0D8] text-[11px] text-[#666C64]">
                      Capabilities features: <strong className="text-[#0C3823] font-bold">{serv.features?.length || 0}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. PRICING MANAGER TAB */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#E5E0D8] rounded-[28px] p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {(['web', 'saas', 'shopify', 'framer'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setEditingPricingCategory(cat)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase transition-all ${
                        editingPricingCategory === cat
                          ? 'bg-[#0C3823] text-white shadow-xs'
                          : 'bg-[#F0EDE5] text-[#666C64] hover:text-[#141915]'
                      }`}
                    >
                      {cat} ({pricing[cat]?.length || 0})
                    </button>
                  ))}
                </div>

                <button
                  onClick={() =>
                    setEditingPricingPlan({
                      plan: {
                        name: 'New Plan',
                        price: { monthly: 1999, annual: 1599 },
                        description: 'Plan description here',
                        features: [{ name: 'Core Feature', included: true }],
                        popular: false,
                        cta: 'Choose Plan',
                      },
                      index: -1,
                    })
                  }
                  className="px-4 py-2.5 rounded-xl bg-[#0C3823] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#164E33] transition-all inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 text-[#CCFF00]" />
                  <span>Add Plan</span>
                </button>
              </div>

              {editingPricingPlan && (
                <form onSubmit={handleSavePricingPlan} className="bg-white border-2 border-[#0C3823] rounded-[28px] p-6 lg:p-8 space-y-5 shadow-lg">
                  <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-4">
                    <h3 className="font-bold text-base uppercase text-[#0C3823] font-heading">
                      Edit Pricing Plan ({editingPricingCategory.toUpperCase()})
                    </h3>
                    <button type="button" onClick={() => setEditingPricingPlan(null)} className="p-2 rounded-xl hover:bg-[#F0EDE5] text-[#666C64]">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1.5 text-[#141915]">Plan Name</label>
                      <input
                        type="text"
                        required
                        value={editingPricingPlan.plan.name || ''}
                        onChange={(e) =>
                          setEditingPricingPlan({
                            ...editingPricingPlan,
                            plan: { ...editingPricingPlan.plan, name: e.target.value },
                          })
                        }
                        className="w-full px-4 py-3 border border-[#E5E0D8] bg-[#FDFBF7] rounded-2xl text-xs text-[#141915]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1.5 text-[#141915]">Monthly Price ($)</label>
                      <input
                        type="number"
                        required
                        value={editingPricingPlan.plan.price?.monthly || 0}
                        onChange={(e) =>
                          setEditingPricingPlan({
                            ...editingPricingPlan,
                            plan: {
                              ...editingPricingPlan.plan,
                              price: {
                                monthly: Number(e.target.value),
                                annual: editingPricingPlan.plan.price?.annual || 0,
                              },
                            },
                          })
                        }
                        className="w-full px-4 py-3 border border-[#E5E0D8] bg-[#FDFBF7] rounded-2xl text-xs text-[#141915]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1.5 text-[#141915]">Annual Price ($/mo)</label>
                      <input
                        type="number"
                        required
                        value={editingPricingPlan.plan.price?.annual || 0}
                        onChange={(e) =>
                          setEditingPricingPlan({
                            ...editingPricingPlan,
                            plan: {
                              ...editingPricingPlan.plan,
                              price: {
                                monthly: editingPricingPlan.plan.price?.monthly || 0,
                                annual: Number(e.target.value),
                              },
                            },
                          })
                        }
                        className="w-full px-4 py-3 border border-[#E5E0D8] bg-[#FDFBF7] rounded-2xl text-xs text-[#141915]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase mb-1.5 text-[#141915]">Description</label>
                    <textarea
                      rows={2}
                      value={editingPricingPlan.plan.description || ''}
                      onChange={(e) =>
                        setEditingPricingPlan({
                          ...editingPricingPlan,
                          plan: { ...editingPricingPlan.plan, description: e.target.value },
                        })
                      }
                      className="w-full px-4 py-3 border border-[#E5E0D8] bg-[#FDFBF7] rounded-2xl text-xs text-[#141915]"
                    />
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingPricingPlan.plan.popular || false}
                        onChange={(e) =>
                          setEditingPricingPlan({
                            ...editingPricingPlan,
                            plan: { ...editingPricingPlan.plan, popular: e.target.checked },
                          })
                        }
                        className="rounded text-[#0C3823] focus:ring-0 w-4 h-4"
                      />
                      <span>Highlight as &quot;Most Popular&quot;</span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E0D8]">
                    <button type="button" onClick={() => setEditingPricingPlan(null)} className="px-5 py-2.5 border border-[#E5E0D8] bg-[#F8F6F0] rounded-xl text-xs font-bold uppercase hover:bg-[#E5E0D8]">
                      Cancel
                    </button>
                    <button type="submit" className="px-6 py-2.5 bg-[#0C3823] text-white rounded-xl text-xs font-bold uppercase inline-flex items-center gap-2 hover:bg-[#164E33] shadow-xs">
                      <Save className="w-4 h-4 text-[#CCFF00]" />
                      <span>Save Plan</span>
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(pricing[editingPricingCategory] || []).map((plan, idx) => (
                  <div
                    key={idx}
                    className={`bg-white border rounded-[28px] p-6 shadow-xs relative flex flex-col justify-between hover:shadow-md transition-all ${
                      plan.popular ? 'border-[#0C3823] ring-2 ring-[#0C3823]' : 'border-[#E5E0D8]'
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-[#0C3823] text-[#CCFF00] text-[10px] font-extrabold uppercase tracking-wider">
                        Popular
                      </span>
                    )}
                    <div>
                      <h3 className="text-xl font-bold uppercase font-heading text-[#141915] mb-2">{plan.name}</h3>
                      <div className="text-3xl font-black text-[#0C3823] font-heading mb-3">
                        ${plan.price.monthly} <span className="text-xs text-[#666C64] font-normal">/mo</span>
                      </div>
                      <p className="text-xs text-[#666C64] mb-4 leading-relaxed">{plan.description}</p>
                    </div>

                    <div className="pt-4 border-t border-[#E5E0D8] flex items-center justify-between">
                      <button
                        onClick={() => setEditingPricingPlan({ plan, index: idx })}
                        className="px-3.5 py-2 rounded-xl border border-[#0C3823] text-[#0C3823] text-xs font-bold uppercase hover:bg-[#0C3823] hover:text-white transition-colors"
                      >
                        Edit Plan
                      </button>
                      <button
                        onClick={() => handleDeletePricingPlan(editingPricingCategory, idx)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. BLOG MANAGER TAB */}
          {activeTab === 'blog' && (
            <div className="space-y-6">
              {editingBlogPost && (
                <form onSubmit={handleSaveBlogPost} className="bg-white border-2 border-[#0C3823] rounded-[28px] p-6 lg:p-8 space-y-6 shadow-lg">
                  <div className="flex items-center justify-between border-b border-[#E5E0D8] pb-4">
                    <h3 className="font-bold text-base uppercase text-[#0C3823] font-heading flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#0C3823]" />
                      <span>{editingBlogPost.slug ? 'Edit Article' : 'Create New Article'}</span>
                    </h3>
                    <button type="button" onClick={() => setEditingBlogPost(null)} className="p-2 rounded-xl hover:bg-[#F0EDE5] text-[#666C64]">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1.5 text-[#141915]">Article Title</label>
                      <input
                        type="text"
                        required
                        value={editingBlogPost.title || ''}
                        onChange={(e) => setEditingBlogPost({ ...editingBlogPost, title: e.target.value })}
                        className="w-full px-4 py-3 border border-[#E5E0D8] bg-[#FDFBF7] rounded-2xl text-xs text-[#141915]"
                        placeholder="e.g. Building Modern Web Apps"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1.5 text-[#141915]">Slug</label>
                      <input
                        type="text"
                        required
                        value={editingBlogPost.slug || ''}
                        onChange={(e) => setEditingBlogPost({ ...editingBlogPost, slug: e.target.value })}
                        className="w-full px-4 py-3 border border-[#E5E0D8] bg-[#FDFBF7] rounded-2xl text-xs text-[#141915]"
                        placeholder="e.g. building-modern-web-apps"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1.5 text-[#141915]">Category</label>
                      <input
                        type="text"
                        value={editingBlogPost.category || 'Engineering'}
                        onChange={(e) => setEditingBlogPost({ ...editingBlogPost, category: e.target.value })}
                        className="w-full px-4 py-3 border border-[#E5E0D8] bg-[#FDFBF7] rounded-2xl text-xs text-[#141915]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1.5 text-[#141915]">Reading Time</label>
                      <input
                        type="text"
                        value={editingBlogPost.readingTime || '5 min read'}
                        onChange={(e) => setEditingBlogPost({ ...editingBlogPost, readingTime: e.target.value })}
                        className="w-full px-4 py-3 border border-[#E5E0D8] bg-[#FDFBF7] rounded-2xl text-xs text-[#141915]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase mb-1.5 text-[#141915]">Excerpt / Brief Summary</label>
                    <textarea
                      rows={2}
                      value={editingBlogPost.excerpt || ''}
                      onChange={(e) => setEditingBlogPost({ ...editingBlogPost, excerpt: e.target.value })}
                      className="w-full px-4 py-3 border border-[#E5E0D8] bg-[#FDFBF7] rounded-2xl text-xs text-[#141915]"
                    />
                  </div>

                  <div>
                    <MarkdownEditor
                      value={editingBlogPost.content || ''}
                      onChange={(val) => setEditingBlogPost({ ...editingBlogPost, content: val })}
                      label="Full Article Content (Markdown Supported with Live Preview & .md Import)"
                      placeholder="Write your article in Markdown. Supports # headers, **bold**, lists, code blocks, and Cloudinary images..."
                      minHeight="min-h-[520px]"
                    />
                  </div>

                  <CloudinaryUploader
                    value={editingBlogPost.image || ''}
                    onChange={(val) => setEditingBlogPost({ ...editingBlogPost, image: val })}
                    label="Blog Header / Cover Image (Cloudinary CldImage)"
                    folder="qubtic_blog"
                  />

                  <div className="flex justify-end gap-3 pt-4 border-t border-[#E5E0D8]">
                    <button type="button" onClick={() => setEditingBlogPost(null)} className="px-5 py-2.5 border border-[#E5E0D8] bg-[#F8F6F0] rounded-xl text-xs font-bold uppercase hover:bg-[#E5E0D8]">
                      Cancel
                    </button>
                    <button type="submit" className="px-6 py-2.5 bg-[#0C3823] text-white rounded-xl text-xs font-bold uppercase inline-flex items-center gap-2 hover:bg-[#164E33] shadow-xs">
                      <Save className="w-4 h-4 text-[#CCFF00]" />
                      <span>Publish Article</span>
                    </button>
                  </div>
                </form>
              )}

              <div className="bg-white border border-[#E5E0D8] rounded-[28px] overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F0EDE5] text-[#0C3823] font-bold uppercase">
                    <tr>
                      <th className="px-6 py-4">Title / Category</th>
                      <th className="px-6 py-4">Reading Time</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E0D8]">
                    {blogPosts.map((post) => (
                      <tr key={post.slug} className="hover:bg-[#F8F6F0]/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-[#141915] text-sm font-heading">{post.title}</div>
                          <div className="text-[#666C64] mt-0.5">{post.category}</div>
                        </td>
                        <td className="px-6 py-4 text-[#666C64] font-medium">{post.readingTime}</td>
                        <td className="px-6 py-4 text-[#666C64] font-mono">{post.date}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={() => setEditingBlogPost(post)} className="p-2 border border-[#E5E0D8] hover:bg-[#F0EDE5] rounded-xl text-[#0C3823]" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteBlogPost(post.slug)} className="p-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. CLIENT INQUIRIES & LEADS TAB */}
          {activeTab === 'inquiries' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold uppercase font-heading text-[#141915]">
                    Client Leads &amp; Inquiries ({inquiries.length})
                  </h3>
                  <p className="text-xs text-[#666C64]">
                    Direct contact submissions stored securely in the Supabase database.
                  </p>
                </div>
              </div>

              {inquiries.length === 0 ? (
                <div className="bg-white border border-[#E5E0D8] rounded-[28px] p-12 text-center shadow-xs">
                  <Inbox className="w-12 h-12 text-[#666C64]/40 mx-auto mb-3" />
                  <h4 className="text-base font-bold uppercase font-heading text-[#141915]">No Inquiries Yet</h4>
                  <p className="text-xs text-[#666C64] max-w-sm mx-auto mt-1">
                    When clients submit the contact or project inquiry form on the website, their submissions will appear here in real-time.
                  </p>
                </div>
              ) : (
                <div className="bg-white border border-[#E5E0D8] rounded-[28px] overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F0EDE5] text-[#0C3823] font-bold uppercase">
                      <tr>
                        <th className="px-6 py-4">Client / Company</th>
                        <th className="px-6 py-4">Service &amp; Budget</th>
                        <th className="px-6 py-4">Message Preview</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E0D8]">
                      {inquiries.map((inq) => (
                        <tr key={inq.id} className="hover:bg-[#F8F6F0]/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-[#141915] text-sm font-heading">{inq.name}</div>
                            <a href={`mailto:${inq.email}`} className="text-[#0C3823] hover:underline font-medium block">
                              {inq.email}
                            </a>
                            {inq.company && (
                              <span className="text-[11px] text-[#666C64] block">Org: {inq.company}</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-block px-2.5 py-1 rounded-full bg-[#0C3823]/10 text-[#0C3823] font-bold text-[11px] mb-1">
                              {inq.service}
                            </span>
                            <div className="text-[#666C64] font-medium font-mono">{inq.budget}</div>
                          </td>
                          <td className="px-6 py-4 max-w-md">
                            <p className="text-[#141915] line-clamp-3 leading-relaxed whitespace-pre-wrap">
                              {inq.message}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-[#666C64] font-mono text-[11px] whitespace-nowrap">
                            {new Date(inq.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                            <a
                              href={`mailto:${inq.email}?subject=Re: Inquiry from ${encodeURIComponent(inq.name)} - Qubtic Studio`}
                              className="inline-flex p-2 border border-[#E5E0D8] hover:bg-[#F0EDE5] rounded-xl text-[#0C3823]"
                              title="Send Email"
                            >
                              <Mail className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => handleDeleteInquiry(inq.id)}
                              className="p-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl"
                              title="Delete Inquiry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 7. MEDIA MANAGER TAB */}
          {activeTab === 'media' && (
            <div className="bg-white border border-[#E5E0D8] rounded-[28px] p-6 shadow-xs">
              <MediaLibraryModal
                isOpen={true}
                onClose={() => setActiveTab('overview')}
              />
            </div>
          )}

          {/* 8. FULL SITE CUSTOMIZER TAB */}
          {activeTab === 'settings' && settings && (
            <div className="space-y-8">
              {/* Authorized Admin Users Table */}
              <div className="bg-white border border-[#E5E0D8] rounded-[28px] p-6 lg:p-8 space-y-6 shadow-xs">
                <div className="border-b border-[#E5E0D8] pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold uppercase font-heading text-[#141915] flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#0C3823]" />
                      <span>Authorized Database Admins ({adminUsers.length})</span>
                    </h3>
                    <p className="text-xs text-[#666C64]">
                      Accounts configured in Supabase PostgreSQL database (`admin_users` table).
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#CCFF00]/30 text-[#0C3823] text-xs font-bold uppercase font-mono">
                    Supabase Synced
                  </span>
                </div>

                <div className="overflow-hidden rounded-2xl border border-[#E5E0D8]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F0EDE5] text-[#0C3823] font-bold uppercase">
                      <tr>
                        <th className="px-5 py-3.5">Admin Name</th>
                        <th className="px-5 py-3.5">Email Address</th>
                        <th className="px-5 py-3.5">Role</th>
                        <th className="px-5 py-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E0D8]">
                      {adminUsers.map((u) => (
                        <tr key={u.id || u.email} className="hover:bg-[#F8F6F0]/60">
                          <td className="px-5 py-3 font-bold text-[#141915] capitalize">{u.name}</td>
                          <td className="px-5 py-3 text-[#0C3823] font-mono">{u.email}</td>
                          <td className="px-5 py-3 capitalize">
                            <span className="px-2.5 py-0.5 rounded-full bg-[#0C3823]/10 text-[#0C3823] font-bold">
                              {u.role || 'Admin'}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
                              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                              Active in DB
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Site Settings Form */}
              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="bg-white border border-[#E5E0D8] rounded-[28px] p-6 lg:p-8 space-y-6 shadow-xs">
                  <div className="border-b border-[#E5E0D8] pb-4 mb-4">
                    <h3 className="text-base font-bold uppercase font-heading text-[#141915]">
                      Global Site Hero &amp; Brand Settings
                    </h3>
                    <p className="text-xs text-[#666C64]">Update hero headline, subtitle badge, and contact emails</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1.5 text-[#141915]">Hero Badge Text</label>
                      <input
                        type="text"
                        value={settings.heroBadge || ''}
                        onChange={(e) => setSettings({ ...settings, heroBadge: e.target.value })}
                        className="w-full px-4 py-3 border border-[#E5E0D8] bg-[#FDFBF7] rounded-2xl text-xs text-[#141915]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-1.5 text-[#141915]">Contact Receiver Email</label>
                      <input
                        type="email"
                        value={settings.contactEmail || ''}
                        onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                        className="w-full px-4 py-3 border border-[#E5E0D8] bg-[#FDFBF7] rounded-2xl text-xs text-[#141915]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase mb-1.5 text-[#141915]">Hero Main Title</label>
                    <input
                      type="text"
                      value={settings.heroTitle || ''}
                      onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                      className="w-full px-4 py-3 border border-[#E5E0D8] bg-[#FDFBF7] rounded-2xl text-xs text-[#141915]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase mb-1.5 text-[#141915]">Hero Subtitle / Description</label>
                    <textarea
                      rows={3}
                      value={settings.heroSubtitle || ''}
                      onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                      className="w-full px-4 py-3 border border-[#E5E0D8] bg-[#FDFBF7] rounded-2xl text-xs text-[#141915]"
                    />
                  </div>

                  <div className="flex justify-end pt-4 border-t border-[#E5E0D8]">
                    <button type="submit" className="px-6 py-3 bg-[#0C3823] text-white rounded-xl text-xs font-bold uppercase inline-flex items-center gap-2 hover:bg-[#164E33] shadow-xs">
                      <Save className="w-4 h-4 text-[#CCFF00]" />
                      <span>Save Site Settings to Supabase</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
