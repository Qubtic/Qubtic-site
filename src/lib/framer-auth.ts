import { hashPassword } from './passwords';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { supabase } from './supabase';
import { getPluginMetadata } from './plugins-registry';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendNewUserTeamNotification,
} from './email-service';

export interface FramerUserRecord {
  id: string;
  email: string;
  name?: string;
  company_name?: string;
  website_url?: string;
  plugin_slug: string;
  plugin_name: string;
  framer_user_id?: string;
  framer_project_id?: string;
  plan: 'free' | 'pro';
  auth_token: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  last_login_at: string;
  is_early_bird?: boolean;
  early_bird_granted_at?: string;
}

export const PAIRING_TTL_SECONDS = 600; // 10 minutes
export const PAIRING_POLL_INTERVAL_SECONDS = 3;

function isCommercePlugin(slug?: string): boolean {
  return slug === 'whatsapp-commerce' || slug === 'telegram-commerce';
}

function requiresCommercePersistence(slug?: string): boolean {
  return process.env.NODE_ENV === 'production' && isCommercePlugin(slug);
}

/**
 * Evaluates Early Bird Pro entitlement status based on registration timestamp.
 * Retired: registration dates never grant Pro. Kept as a compatibility helper.
 */
export function evaluateEarlyBirdStatus() {
  return { plan: 'free' as const, is_early_bird: false };
}

/** Free and Pro are the only account tiers. Legacy early-bird grants carry no access. */
export function accountPlan(user?: Partial<FramerUserRecord> | null): 'free' | 'pro' {
  if (!user || user.status === 'pending_verification' || user.is_early_bird === true || user.metadata?.is_early_bird === true) return 'free';
  return user.plan === 'pro' ? 'pro' : 'free';
}

export type PairingSessionStatus = 'pending' | 'confirmed' | 'consumed' | 'expired';

export interface FramerPairingSessionRecord {
  id: string;
  device_code: string;        // 256-bit entropy = 64 hex characters
  user_code: string;          // Human friendly e.g. FD-8492
  plugin_slug: string;
  plugin_name: string;
  status: PairingSessionStatus;
  created_at: string;
  expires_at: string;
  ttl_seconds: number;
  poll_interval: number;      // default 3s
  poll_count: number;
  last_poll_at?: number;      // epoch ms timestamp
  auth_token?: string | null;
  user_data?: {
    id: string;
    email: string;
    name?: string;
    company_name?: string;
    website_url?: string;
    plan: string;
    is_early_bird?: boolean;
    status?: string;
  } | null;
  metadata?: Record<string, unknown>;
  updated_at: string;
}

const STORE_DIR = path.join(process.cwd(), 'src', 'data', 'store');
const FALLBACK_FILE = path.join(STORE_DIR, 'framer_users.json');
const PAIRING_STORE_FILE = path.join(STORE_DIR, 'pairing_sessions.json');

function ensureStoreDir() {
  if (!fs.existsSync(STORE_DIR)) {
    try {
      fs.mkdirSync(STORE_DIR, { recursive: true });
    } catch {
      // ignore
    }
  }
}

function readLocalUsers(): FramerUserRecord[] {
  try {
    ensureStoreDir();
    if (!fs.existsSync(FALLBACK_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(FALLBACK_FILE, 'utf-8');
    return JSON.parse(raw) as FramerUserRecord[];
  } catch (err) {
    console.error('Error reading local framer_users fallback:', err);
    return [];
  }
}

function writeLocalUsers(users: FramerUserRecord[]) {
  try {
    ensureStoreDir();
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local framer_users fallback:', err);
  }
}

export function generateFramerAuthToken(pluginSlug: string): string {
  const random = crypto.randomBytes(24).toString('hex');
  const cleanSlug = pluginSlug.replace(/[^a-z0-9]/gi, '').slice(0, 8).toLowerCase();
  return `qbt_fr_${cleanSlug}_${random}`;
}

export function generateSessionCode(): string {
  // 6-digit alpha-numeric pin for manual fallback in Framer plugins
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Validates and sanitizes a redirect URL.
 * Only allows safe relative paths or safe http/https URLs.
 * Strictly blocks javascript:, data:, vbscript:, etc.
 */
export function sanitizeRedirectUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  // Block javascript:, data:, vbscript:, and control characters
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return null;
  }

  // Safe relative paths starting with single '/' (not '//' protocol-relative)
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed;
  }

  // Absolute URLs - must have valid http: or https: scheme
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    const host = parsed.hostname.toLowerCase();
    const isAllowedHost =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === 'qubtic.tech' ||
      host.endsWith('.qubtic.tech') ||
      host === 'framer.com' ||
      host.endsWith('.framer.com') ||
      host === 'framer.wiki';

    if (isAllowedHost) {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Creates or updates a user for a given Framer plugin.
 * Checks Supabase first; if table doesn't exist yet, saves locally.
 */
export async function createOrUpdateFramerUser(params: {
  email: string;
  name?: string;
  company_name?: string;
  website_url?: string;
  pluginSlug: string;
  framerUserId?: string;
  framerProjectId?: string;
  plan?: 'free' | 'pro';
  metadata?: Record<string, unknown>;
}): Promise<{ user: FramerUserRecord; isNew: boolean; token: string }> {
  const normalizedEmail = params.email.toLowerCase().trim();
  const pluginSlug = getPluginMetadata(params.pluginSlug).slug;
  const plugin = getPluginMetadata(pluginSlug);
  const commerce = isCommercePlugin(plugin.slug);
  const now = new Date().toISOString();
  const token = generateFramerAuthToken(pluginSlug);

  // 1. Try Supabase
  try {
    const { data: existing, error: selectErr } = await supabase
      .from('framer_users')
      .select('*')
      .eq('email', normalizedEmail)
      .eq('plugin_slug', pluginSlug)
      .maybeSingle();

    if (!selectErr) {
      if (existing) {
        // Update existing user with new token & login time
        const rawCompany = params.company_name;
        const hasValidCompany = typeof rawCompany === 'string' && rawCompany.trim().length > 0;
        const companyToSave = hasValidCompany ? rawCompany.trim() : existing.company_name;

        const rawWebsite = params.website_url;
        const hasValidWebsite = typeof rawWebsite === 'string' && rawWebsite.trim().length > 0;
        const websiteToSave = hasValidWebsite ? rawWebsite.trim() : existing.website_url;

        const wasPending = existing.status === 'pending_verification';

        // Evaluate Early Bird Pro entitlement for existing user
        // Retired: preserve only an explicit, non-promotional server Pro plan.
        const resolvedPlan = accountPlan(existing);
        const resolvedIsEarlyBird = false;
        const resolvedEarlyBirdGrantedAt = undefined;

        const dbUpdatePayload = {
          name: params.name || existing.name || '',
          company_name: companyToSave,
          website_url: websiteToSave,
          plugin_name: plugin.name,
          auth_token: token,
          plan: resolvedPlan,
          status: 'active',
          last_login_at: now,
          updated_at: now,
          framer_user_id: params.framerUserId || existing.framer_user_id,
          framer_project_id: params.framerProjectId || existing.framer_project_id,
          metadata: {
            ...(existing.metadata || {}),
            ...(params.metadata || {}),
            email_verified: true,
            ...(hasValidCompany ? { company_name: companyToSave } : {}),
            ...(hasValidWebsite ? { website_url: websiteToSave } : {}),
            is_early_bird: resolvedIsEarlyBird,
            ...(resolvedEarlyBirdGrantedAt ? { early_bird_granted_at: resolvedEarlyBirdGrantedAt } : {}),
          },
        };

        const { data: updated, error: updateErr } = await supabase
          .from('framer_users')
          .update(dbUpdatePayload)
          .eq('id', existing.id)
          .select()
          .single();

        if (!updateErr && updated) {
          const userWithAttrs = ensureEarlyBirdAttributes({
            ...updated,
            is_early_bird: resolvedIsEarlyBird,
            early_bird_granted_at: resolvedEarlyBirdGrantedAt,
          } as FramerUserRecord);
          syncUserLocally(userWithAttrs);

          if (wasPending) {
            sendNewUserTeamNotification(userWithAttrs, params.metadata, pluginSlug).catch((err) => {
              console.warn('[Team Alert] Error sending team notification:', err);
            });
            return { user: userWithAttrs, isNew: true, token };
          }

          return { user: userWithAttrs, isNew: false, token };
        } else if (updateErr) {
          console.warn('Supabase framer_users update error:', updateErr);
        }
      } else {
        // Create brand new user
        const earlyBird = evaluateEarlyBirdStatus();
        const assignedPlan = 'free' as const;

        const dbInsertPayload = {
          email: normalizedEmail,
          name: params.name || normalizedEmail.split('@')[0],
          company_name: params.company_name || '',
          website_url: params.website_url || '',
          plugin_slug: pluginSlug,
          plugin_name: plugin.name,
          framer_user_id: params.framerUserId || '',
          framer_project_id: params.framerProjectId || '',
          plan: assignedPlan,
          auth_token: token,
          status: 'active',
          metadata: {
            ...(params.metadata || {}),
            email_verified: true,
            ...(params.company_name ? { company_name: params.company_name } : {}),
            ...(params.website_url ? { website_url: params.website_url } : {}),
            is_early_bird: earlyBird.is_early_bird,
            ...(earlyBird.is_early_bird ? { early_bird_granted_at: now } : {}),
          },
          created_at: now,
          updated_at: now,
          last_login_at: now,
        };

        const { data: created, error: insertErr } = await supabase
          .from('framer_users')
          .insert(dbInsertPayload)
          .select()
          .single();

        if (!insertErr && created) {
          const userWithAttrs = ensureEarlyBirdAttributes({
            ...created,
            is_early_bird: earlyBird.is_early_bird,
            early_bird_granted_at: earlyBird.is_early_bird ? now : undefined,
          } as FramerUserRecord);
          syncUserLocally(userWithAttrs);

          // Asynchronously notify Qubtic team of new member registration
          sendNewUserTeamNotification(userWithAttrs, params.metadata, pluginSlug).catch((err) => {
            console.warn('[Team Alert] Error sending team notification:', err);
          });

          return { user: userWithAttrs, isNew: true, token };
        } else if (insertErr) {
          console.warn('Supabase framer_users insert error:', insertErr);
        }
      }
    }
  } catch (sbErr) {
    console.warn('Supabase framer_users query failed, falling back to local store:', sbErr);
  }

  if (commerce && process.env.NODE_ENV === 'production') throw new Error('Commerce account database is unavailable.');
  // 2. Local Fallback (ensures zero crashes if Supabase table is not yet migrated)
  const localList = readLocalUsers();
  const existingIdx = localList.findIndex(
    (u) => u.email === normalizedEmail && u.plugin_slug === pluginSlug
  );

  if (existingIdx >= 0) {
    const existing = localList[existingIdx];
    const wasPending = existing.status === 'pending_verification';
    existing.name = params.name || existing.name;
    const rawCompany = params.company_name;
    const hasValidCompany = typeof rawCompany === 'string' && rawCompany.trim().length > 0;
    if (hasValidCompany) {
      existing.company_name = rawCompany.trim();
    }
    const rawWebsite = params.website_url;
    const hasValidWebsite = typeof rawWebsite === 'string' && rawWebsite.trim().length > 0;
    if (hasValidWebsite) {
      existing.website_url = rawWebsite.trim();
    }
    existing.auth_token = token;
    existing.status = 'active';
    existing.last_login_at = now;
    existing.updated_at = now;
    if (params.framerUserId) existing.framer_user_id = params.framerUserId;
    if (params.framerProjectId) existing.framer_project_id = params.framerProjectId;

    existing.plan = accountPlan(existing);
    existing.is_early_bird = false;
    existing.early_bird_granted_at = undefined;

    existing.metadata = {
      ...(existing.metadata || {}),
      ...(params.metadata || {}),
      email_verified: true,
      ...(hasValidCompany ? { company_name: existing.company_name } : {}),
      ...(hasValidWebsite ? { website_url: existing.website_url } : {}),
      is_early_bird: existing.is_early_bird,
      ...(existing.early_bird_granted_at
        ? { early_bird_granted_at: existing.early_bird_granted_at }
        : {}),
    };

    localList[existingIdx] = existing;
    writeLocalUsers(localList);

    if (wasPending) {
      sendNewUserTeamNotification(existing, params.metadata, pluginSlug).catch((err) => {
        console.warn('[Team Alert] Error sending team notification:', err);
      });
      return { user: existing, isNew: true, token };
    }

    return { user: existing, isNew: false, token };
  } else {
    const earlyBird = evaluateEarlyBirdStatus();
    const assignedPlan = 'free' as const;

    const newRecord: FramerUserRecord = {
      id: crypto.randomUUID(),
      email: normalizedEmail,
      name: params.name || normalizedEmail.split('@')[0],
      company_name: params.company_name || '',
      website_url: params.website_url || '',
      plugin_slug: pluginSlug,
      plugin_name: plugin.name,
      framer_user_id: params.framerUserId || '',
      framer_project_id: params.framerProjectId || '',
      plan: assignedPlan,
      auth_token: token,
      status: 'active',
      is_early_bird: earlyBird.is_early_bird,
      early_bird_granted_at: earlyBird.is_early_bird ? now : undefined,
      metadata: {
        ...(params.metadata || {}),
        email_verified: true,
        ...(params.company_name ? { company_name: params.company_name } : {}),
        ...(params.website_url ? { website_url: params.website_url } : {}),
        is_early_bird: earlyBird.is_early_bird,
        ...(earlyBird.is_early_bird ? { early_bird_granted_at: now } : {}),
      },
      created_at: now,
      updated_at: now,
      last_login_at: now,
    };

    localList.unshift(newRecord);
    writeLocalUsers(localList);

    // Asynchronously notify Qubtic team of new member registration
    sendNewUserTeamNotification(newRecord, params.metadata, pluginSlug).catch((err) => {
      console.warn('[Team Alert] Error sending team notification:', err);
    });

    return { user: newRecord, isNew: true, token };
  }
}

function syncUserLocally(user: FramerUserRecord) {
  const localList = readLocalUsers();
  const idx = localList.findIndex((u) => u.id === user.id || (u.email === user.email && u.plugin_slug === user.plugin_slug));
  if (idx >= 0) {
    localList[idx] = user;
  } else {
    localList.unshift(user);
  }
  writeLocalUsers(localList);
}

function ensureEarlyBirdAttributes(user: FramerUserRecord): FramerUserRecord {
  return { ...user, plan: accountPlan(user), is_early_bird: false, early_bird_granted_at: undefined };
}

/**
 * Finds an existing Framer user by email and plugin slug.
 * Checks Supabase first, falls back to local JSON store.
 */
export async function findFramerUser(
  email: string,
  pluginSlug: string
): Promise<FramerUserRecord | null> {
  const normalizedEmail = email.toLowerCase().trim();
  const cleanPluginSlug = pluginSlug.toLowerCase().trim();

  // 1. Try Supabase
  try {
    const { data: existing, error } = await supabase
      .from('framer_users')
      .select('*')
      .eq('email', normalizedEmail)
      .eq('plugin_slug', cleanPluginSlug)
      .maybeSingle();

    if (!error && existing) {
      return ensureEarlyBirdAttributes(existing as FramerUserRecord);
    }
  } catch {
    // Ignore and fallback to local
  }

  if (requiresCommercePersistence(cleanPluginSlug)) return null;

  // 2. Check local fallback
  const localList = readLocalUsers();
  const match = localList.find(
    (u) => u.email === normalizedEmail && u.plugin_slug === cleanPluginSlug
  );

  return match ? ensureEarlyBirdAttributes(match) : null;
}

/**
 * Verifies a Framer session token.
 */
export async function verifyFramerSessionToken(
  token: string,
  expectedPlugin?: string
): Promise<FramerUserRecord | null> {
  if (!token) return null;
  expectedPlugin = expectedPlugin ? getPluginMetadata(expectedPlugin).slug : undefined;
  const tokenPlugin = token.startsWith('qbt_fr_whatsapp_') ? 'whatsapp-commerce'
    : token.startsWith('qbt_fr_telegram_') ? 'telegram-commerce' : undefined;
  if (tokenPlugin && expectedPlugin && tokenPlugin !== expectedPlugin) return null;
  expectedPlugin = expectedPlugin || tokenPlugin;

  // 1. Check Supabase
  try {
    let query = supabase.from('framer_users').select('*').eq('auth_token', token);
    if (expectedPlugin) {
      query = query.eq('plugin_slug', expectedPlugin.toLowerCase().trim());
    }
    const { data, error } = await query.maybeSingle();
    if (!error && data) {
      if (isCommercePlugin(data.plugin_slug) && (data.status !== 'active' || data.metadata?.email_verified !== true)) return null;
      return ensureEarlyBirdAttributes(data as FramerUserRecord);
    }
  } catch (_err) {
    // Fall back to local
  }

  // WhatsApp Commerce uses only current account records in production, never pairing snapshots.
  if (process.env.NODE_ENV === 'production') return null;
  // 2. Check local fallback
  const localList = readLocalUsers();
  const match = localList.find((u) => {
    if (u.auth_token !== token) return false;
    if (expectedPlugin && u.plugin_slug !== expectedPlugin.toLowerCase().trim()) return false;
    return true;
  });

  if (match) {
    if (isCommercePlugin(match.plugin_slug) && (match.status !== 'active' || match.metadata?.email_verified !== true)) return null;
    return ensureEarlyBirdAttributes(match);
  }
  if (isCommercePlugin(expectedPlugin)) return null;

  // 3. Check Supabase framer_pairing_sessions (in case token was generated/issued during pairing)
  try {
    let pQuery = supabase.from('framer_pairing_sessions').select('*').eq('auth_token', token);
    if (expectedPlugin) {
      pQuery = pQuery.eq('plugin_slug', expectedPlugin.toLowerCase().trim());
    }
    const { data: pSession, error: pErr } = await pQuery.maybeSingle();
    if (!pErr && pSession && pSession.user_data && !isCommercePlugin(pSession.plugin_slug)) {
      const uData = pSession.user_data as Partial<FramerUserRecord>;
      if (uData.email) {
        try {
          await supabase
            .from('framer_users')
            .update({ auth_token: token })
            .eq('email', uData.email.toLowerCase().trim())
            .eq('plugin_slug', (expectedPlugin || pSession.plugin_slug).toLowerCase().trim());
        } catch {}
      }
      return ensureEarlyBirdAttributes({
        id: uData.id || pSession.id,
        email: uData.email,
        name: uData.name || (uData.email ? uData.email.split('@')[0] : 'Designer'),
        company_name: uData.company_name || '',
        website_url: uData.website_url || '',
        plugin_slug: pSession.plugin_slug,
        plugin_name: pSession.plugin_name,
        plan: uData.plan === 'pro' && !uData.is_early_bird ? 'pro' : 'free',
        auth_token: token,
        status: uData.status || 'active',
        is_early_bird: Boolean(uData.is_early_bird),
        created_at: pSession.created_at,
        updated_at: pSession.updated_at,
        last_login_at: pSession.last_poll_at || pSession.updated_at,
      } as FramerUserRecord);
    }
  } catch (_pEx) {
    // ignore
  }

  // 4. Check local pairing sessions fallback
  const localPairingList = readLocalPairingSessions();
  const pMatch = localPairingList.find((p) => {
    if (p.auth_token !== token) return false;
    if (expectedPlugin && p.plugin_slug !== expectedPlugin.toLowerCase().trim()) return false;
    return true;
  });
  if (pMatch && pMatch.user_data && !isCommercePlugin(pMatch.plugin_slug)) {
    const uData = pMatch.user_data as Partial<FramerUserRecord>;
    return ensureEarlyBirdAttributes({
      id: uData.id || pMatch.id,
      email: uData.email,
      name: uData.name || (uData.email ? uData.email.split('@')[0] : 'Designer'),
      company_name: uData.company_name || '',
      website_url: uData.website_url || '',
      plugin_slug: pMatch.plugin_slug,
      plugin_name: pMatch.plugin_name,
      plan: uData.plan === 'pro' && !uData.is_early_bird ? 'pro' : 'free',
      auth_token: token,
      status: uData.status || 'active',
      is_early_bird: Boolean(uData.is_early_bird),
      created_at: pMatch.created_at,
      updated_at: pMatch.updated_at,
      last_login_at: pMatch.updated_at,
    } as FramerUserRecord);
  }

  return null;
}

/**
 * Lists all Framer users for the Admin Dashboard.
 */
export async function getFramerUsersList(pluginFilter?: string): Promise<{
  users: FramerUserRecord[];
  stats: {
    total: number;
    qubeAuth: number;
    frameDrop: number;
    whatsappCommerce: number;
    proCount: number;
    activeToday: number;
  };
}> {
  let allUsers: FramerUserRecord[] = [];

  // Try Supabase first
  try {
    const query = supabase
      .from('framer_users')
      .select('*')
      .order('last_login_at', { ascending: false });

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      allUsers = data as FramerUserRecord[];
    } else {
      allUsers = readLocalUsers();
    }
  } catch {
    allUsers = readLocalUsers();
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const stats = {
    total: allUsers.length,
    qubeAuth: allUsers.filter((u) => u.plugin_slug === 'qube-auth').length,
    frameDrop: allUsers.filter((u) => u.plugin_slug === 'frame-drop').length,
    whatsappCommerce: allUsers.filter((u) => u.plugin_slug === 'whatsapp-commerce').length,
    proCount: allUsers.filter((u) => accountPlan(u) === 'pro').length,
    activeToday: allUsers.filter((u) => new Date(u.last_login_at) >= todayStart).length,
  };

  if (pluginFilter && pluginFilter !== 'all') {
    allUsers = allUsers.filter((u) => u.plugin_slug === pluginFilter.toLowerCase());
  }

  return { users: allUsers, stats };
}

/**
 * Deletes a Framer user (admin action).
 */
export async function deleteFramerUser(id: string): Promise<boolean> {
  try {
    await supabase.from('framer_users').delete().eq('id', id);
  } catch {
    // ignore
  }

  const local = readLocalUsers().filter((u) => u.id !== id);
  writeLocalUsers(local);
  return true;
}

// -----------------------------------------------------------------------------
// RFC 8628 PAIRING SESSION PROTOCOL LIFECYCLE (F8, F9, F10)
// -----------------------------------------------------------------------------

// In-memory cache for fast, atomic operations and race-condition prevention
const inMemoryPairingSessions = new Map<string, FramerPairingSessionRecord>();

export function readLocalPairingSessions(): FramerPairingSessionRecord[] {
  try {
    ensureStoreDir();
    if (!fs.existsSync(PAIRING_STORE_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(PAIRING_STORE_FILE, 'utf-8');
    const sessions = JSON.parse(raw) as FramerPairingSessionRecord[];
    for (const s of sessions) {
      if (!inMemoryPairingSessions.has(s.device_code)) {
        inMemoryPairingSessions.set(s.device_code, s);
      }
      if (!inMemoryPairingSessions.has(s.user_code)) {
        inMemoryPairingSessions.set(s.user_code, s);
      }
    }
    return sessions;
  } catch (err) {
    console.error('Error reading local pairing_sessions fallback:', err);
    return [];
  }
}

export function writeLocalPairingSessions(sessions: FramerPairingSessionRecord[]) {
  try {
    ensureStoreDir();
    fs.writeFileSync(PAIRING_STORE_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local pairing_sessions fallback:', err);
  }
}

function syncPairingSessionLocally(session: FramerPairingSessionRecord) {
  inMemoryPairingSessions.set(session.device_code, session);
  inMemoryPairingSessions.set(session.user_code, session);
  const list = readLocalPairingSessions();
  const idx = list.findIndex(
    (s) => s.id === session.id || s.device_code === session.device_code || s.user_code === session.user_code
  );
  if (idx >= 0) {
    list[idx] = session;
  } else {
    list.unshift(session);
  }
  writeLocalPairingSessions(list);
}

/**
 * Generates an unambiguous human-friendly user code (e.g. FD-8492)
 * Excluding ambiguous characters: 0, O, 1, I
 */
export function generateUserCode(prefix = 'FD'): string {
  const unambiguousChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let body = '';
  for (let i = 0; i < 4; i++) {
    body += unambiguousChars.charAt(Math.floor(Math.random() * unambiguousChars.length));
  }
  return `${prefix}-${body}`;
}

/**
 * Initiates an RFC 8628 Pairing Session
 */
export async function initiatePairingSession(params?: {
  pluginSlug?: string;
  pluginName?: string;
  ttlSeconds?: number;
  metadata?: Record<string, unknown>;
  customNow?: number;
}): Promise<{
  success: boolean;
  device_code: string;
  user_code: string;
  verification_uri: string;
  verification_uri_complete: string;
  expires_in: number;
  interval: number;
}> {
  const pluginSlug = getPluginMetadata(params?.pluginSlug || 'frame-drop').slug;
  const pluginMeta = getPluginMetadata(pluginSlug);
  const pluginName = isCommercePlugin(pluginSlug) ? pluginMeta.name : params?.pluginName || pluginMeta.name;

  // Clamp TTL between 60s and 3600s, default 600s (RFC 8628 timing contracts)
  const requestedTtl = params?.ttlSeconds ?? PAIRING_TTL_SECONDS;
  const ttlSeconds = Math.max(60, Math.min(requestedTtl, 3600));

  const deviceCode = crypto.randomBytes(32).toString('hex'); // 256-bit entropy = 64 hex chars
  // Telegram's existing plugin also uses WC-; the stored plugin slug isolates sessions.
  const userCode = generateUserCode(isCommercePlugin(pluginSlug) ? 'WC' : 'FD');
  const nowMs = params?.customNow ?? Date.now();
  const nowIso = new Date(nowMs).toISOString();
  const expiresAt = new Date(nowMs + ttlSeconds * 1000).toISOString();

  const sessionRecord: FramerPairingSessionRecord = {
    id: crypto.randomUUID(),
    device_code: deviceCode,
    user_code: userCode,
    plugin_slug: pluginSlug,
    plugin_name: pluginName,
    status: 'pending',
    created_at: nowIso,
    expires_at: expiresAt,
    ttl_seconds: ttlSeconds,
    poll_interval: PAIRING_POLL_INTERVAL_SECONDS,
    poll_count: 0,
    last_poll_at: 0,
    auth_token: null,
    user_data: null,
    metadata: params?.metadata || {},
    updated_at: nowIso,
  };

  // Never publish a production Commerce pairing before persistence succeeds.
  if (!requiresCommercePersistence(pluginSlug)) syncPairingSessionLocally(sessionRecord);

  // Sync to Supabase using exact database schema columns
  try {
    const supabasePayload = {
      id: sessionRecord.id,
      device_code: sessionRecord.device_code,
      user_code: sessionRecord.user_code,
      plugin_slug: sessionRecord.plugin_slug,
      plugin_name: sessionRecord.plugin_name,
      status: sessionRecord.status,
      expires_at: sessionRecord.expires_at,
      poll_interval: sessionRecord.poll_interval,
      poll_count: 0,
      last_poll_at: null,
      auth_token: null,
      user_data: null,
      metadata: sessionRecord.metadata || {},
      created_at: sessionRecord.created_at,
      updated_at: sessionRecord.updated_at,
    };
    const { error: sbErr } = await supabase.from('framer_pairing_sessions').insert(supabasePayload);
    if (sbErr) {
      if (isCommercePlugin(pluginSlug) && process.env.NODE_ENV === 'production') throw new Error('Pairing database unavailable.');
      console.warn('Supabase framer_pairing_sessions insert error:', sbErr);
    }
  } catch (sbEx) {
    if (isCommercePlugin(pluginSlug) && process.env.NODE_ENV === 'production') throw new Error('Pairing database unavailable.');
    console.warn('Supabase framer_pairing_sessions insert exception:', sbEx);
  }

  let lockedUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.qubtic.tech';
  if (lockedUrl === 'https://qubtic.tech' || lockedUrl === 'http://qubtic.tech') {
    lockedUrl = 'https://www.qubtic.tech';
  }
  const authSlug = pluginSlug === 'frame-drop' || pluginSlug === 'framedrop' ? 'frame-drop' : pluginSlug;
  const verificationUri = `${lockedUrl}/auth/${authSlug}`;
  const verificationUriComplete = `${verificationUri}?code=${userCode}`;

  return {
    success: true,
    device_code: deviceCode,
    user_code: userCode,
    verification_uri: verificationUri,
    verification_uri_complete: verificationUriComplete,
    expires_in: ttlSeconds,
    interval: PAIRING_POLL_INTERVAL_SECONDS,
  };
}

/**
 * Confirms a pairing session with the authenticated user context
 */
export async function confirmPairingSession(
  userCode: string,
  user: FramerUserRecord | {
    id: string;
    email: string;
    name?: string;
    company_name?: string;
    website_url?: string;
    plan?: string;
    is_early_bird?: boolean;
    status?: string;
    auth_token?: string;
    plugin_slug?: string;
  } | null,
  customNow: number = Date.now()
): Promise<{
  success: boolean;
  status?: number;
  message?: string;
  error?: string;
}> {
  if (!userCode || typeof userCode !== 'string') {
    return { success: false, status: 400, error: 'Invalid pairing code format' };
  }

  const normalizedCode = userCode.trim().toUpperCase();

  // Suspended account check
  if (user && user.status === 'suspended') {
    return {
      success: false,
      status: 403,
      error: 'Suspended accounts cannot authorize plugins',
    };
  }

  // Find session: check Supabase first (distributed source of truth across serverless instances)
  let session: FramerPairingSessionRecord | null = null;
  let persisted = false;
  try {
    const { data, error } = await supabase
      .from('framer_pairing_sessions')
      .select('*')
      .eq('user_code', normalizedCode)
      .maybeSingle();
    if (!error && data) {
      session = data as FramerPairingSessionRecord;
      persisted = true;
    }
  } catch {
    // ignore
  }

  if (!session) {
    session = inMemoryPairingSessions.get(normalizedCode) || null;
  }
  if (!session) {
    const list = readLocalPairingSessions();
    session = list.find((s) => s.user_code === normalizedCode || s.user_code.toUpperCase() === normalizedCode) || null;
  }

  if (!session) {
    return { success: false, status: 404, error: 'Invalid pairing code' };
  }

  if (!persisted && requiresCommercePersistence(session.plugin_slug)) {
    return { success: false, status: 503, error: 'Pairing database unavailable.' };
  }

  // Work on a copy so failed persistence cannot confirm the cached session.
  session = { ...session };

  // Plugin identity is part of the authorization, not just a display label.
  if (isCommercePlugin(session.plugin_slug) || isCommercePlugin(user?.plugin_slug)) {
    if (!user || user.plugin_slug !== session.plugin_slug || user.status !== 'active' || !user.auth_token) {
      return { success: false, status: 403, error: 'Sign in to the matching plugin account before connecting.' };
    }
  }

  if (isCommercePlugin(session.plugin_slug)) {
    const verified = user?.auth_token ? await verifyFramerSessionToken(user.auth_token, session.plugin_slug) : null;
    if (!verified || verified.id !== user?.id) {
      return { success: false, status: 403, error: 'Sign in to the matching plugin account before connecting.' };
    }
    user = verified;
    if (session.status === 'confirmed' && (session.user_data?.id !== user.id || session.auth_token !== user.auth_token)) {
      return { success: false, status: 409, error: 'Pairing already authorized by another session.' };
    }
  }

  const expiresTime = new Date(session.expires_at).getTime();
  if (!Number.isFinite(expiresTime) || customNow >= expiresTime) {
    session.status = 'expired';
    session.updated_at = new Date(customNow).toISOString();
    syncPairingSessionLocally(session);
    return { success: false, status: 410, error: 'Pairing code expired' };
  }

  if (session.status === 'consumed') {
    return { success: false, status: 410, error: 'Session already consumed' };
  }

  if (session.status === 'confirmed') {
    // Repeated confirmation idempotency
    return { success: true, message: 'Plugin paired successfully' };
  }

  if (session.status !== 'pending') return { success: false, status: 410, error: 'Pairing session is not pending.' };

  // Transition to confirmed
  const authToken = user?.auth_token || generateFramerAuthToken(session.plugin_slug);
  session.status = 'confirmed';
  session.auth_token = authToken;
  session.user_data = user
    ? {
        id: user.id,
        email: user.email,
        name: user.name,
        company_name: user.company_name,
        website_url: user.website_url,
        plan: user.plan === 'pro' && !user.is_early_bird ? 'pro' : 'free',
        is_early_bird: false,
        status: user.status || 'active',
      }
    : null;
  session.updated_at = new Date(customNow).toISOString();

  // Local fallback is development-only for Commerce.
  if (!requiresCommercePersistence(session.plugin_slug)) syncPairingSessionLocally(session);

  try {
    const { data: confirmed, error: sbUpdateErr } = await supabase
      .from('framer_pairing_sessions')
      .update({
        status: 'confirmed',
        auth_token: session.auth_token,
        user_data: session.user_data,
        updated_at: session.updated_at,
      })
      .eq('user_code', normalizedCode)
      .eq('plugin_slug', session.plugin_slug)
      .eq('status', 'pending')
      .select('id')
      .maybeSingle();
    if (requiresCommercePersistence(session.plugin_slug) && (sbUpdateErr || !confirmed)) {
      return { success: false, status: 503, error: 'Could not persist pairing confirmation. Try again.' };
    }
    if (sbUpdateErr) {
      console.warn('Supabase pairing confirm error:', sbUpdateErr);
    }
  } catch (sbErr) {
    if (requiresCommercePersistence(session.plugin_slug)) return { success: false, status: 503, error: 'Pairing database unavailable.' };
    console.warn('Supabase pairing confirm exception:', sbErr);
  }

  // Commerce reuses a live account token; never restore a stale token after rotation.
  if (!isCommercePlugin(session.plugin_slug) && (user?.id || user?.email)) {
    try {
      let uQuery = supabase.from('framer_users').update({
        auth_token: session.auth_token,
        last_login_at: new Date(customNow).toISOString(),
      });
      if (user.id) {
        uQuery = uQuery.eq('id', user.id);
      } else if (user.email) {
        uQuery = uQuery.eq('email', user.email.toLowerCase().trim()).eq('plugin_slug', session.plugin_slug);
      }
      await uQuery;
    } catch (uErr) {
      console.warn('Supabase framer_users auth_token sync error:', uErr);
    }
  }

  return { success: true, message: 'Plugin paired successfully' };
}

/**
 * Resolves a pairing session using device_code (atomic anti-replay single-use transition to consumed)
 */
export async function resolvePairingSession(
  deviceCode: string,
  customNow: number = Date.now(),
  minIntervalMs: number = 0
): Promise<{
  success: boolean;
  status: string | number;
  retry_in?: number;
  auth_token?: string | null;
  user?: Partial<FramerUserRecord> | Record<string, unknown> | null;
  error?: string;
}> {
  if (
    !deviceCode ||
    typeof deviceCode !== 'string' ||
    deviceCode.length !== 64 ||
    !/^[0-9a-f]{64}$/.test(deviceCode)
  ) {
    return { success: false, status: 400, error: 'Invalid device code format' };
  }

  // Look up session from Supabase first (distributed source of truth across serverless instances)
  let session: FramerPairingSessionRecord | null = null;
  let persisted = false;
  try {
    const { data, error } = await supabase
      .from('framer_pairing_sessions')
      .select('*')
      .eq('device_code', deviceCode)
      .maybeSingle();
    if (!error && data) {
      session = data as FramerPairingSessionRecord;
      persisted = true;
      syncPairingSessionLocally(session);
    }
  } catch {
    // ignore
  }

  if (!session) {
    session = inMemoryPairingSessions.get(deviceCode) || null;
  }
  if (!session) {
    const list = readLocalPairingSessions();
    session = list.find((s) => s.device_code === deviceCode) || null;
  }

  if (!session) {
    return { success: false, status: 404, error: 'Invalid device code' };
  }

  if (!persisted && requiresCommercePersistence(session.plugin_slug)) {
    return { success: false, status: 503, error: 'Pairing database unavailable.' };
  }

  if (requiresCommercePersistence(session.plugin_slug)) {
    const expires = new Date(session.expires_at).getTime();
    if (!Number.isFinite(expires) || customNow >= expires) return { success: false, status: 410, error: 'Session expired' };
    const lastPoll = session.last_poll_at ? new Date(session.last_poll_at).getTime() : 0;
    if (minIntervalMs > 0 && customNow - lastPoll < minIntervalMs) return { success: false, status: 429, error: 'slow_down', retry_in: 3 };
    if (session.status === 'pending') return { success: true, status: 'authorization_pending', retry_in: 3 };
    if (!['confirmed', 'consumed'].includes(session.status)) return { success: false, status: 410, error: 'Invalid session state' };
    if (session.status === 'consumed' && customNow - new Date(session.updated_at).getTime() >= 120000) return { success: false, status: 410, error: 'Session token already consumed (replay prevented)' };
    const account = session.auth_token ? await verifyFramerSessionToken(session.auth_token, session.plugin_slug) : null;
    if (!account || account.id !== session.user_data?.id) return { success: false, status: 401, error: 'Plugin session is no longer active.' };
    if (session.status === 'confirmed') {
      try {
        const { data, error } = await supabase.from('framer_pairing_sessions')
          .update({ status: 'consumed', poll_count: (session.poll_count || 0) + 1, last_poll_at: new Date(customNow).toISOString(), updated_at: new Date(customNow).toISOString() })
          .eq('id', session.id).eq('plugin_slug', session.plugin_slug).eq('status', 'confirmed').eq('auth_token', account.auth_token)
          .select('id').maybeSingle();
        if (error || !data) return { success: false, status: 503, error: 'Could not persist pairing resolution. Try again.' };
      } catch {
        return { success: false, status: 503, error: 'Pairing database unavailable.' };
      }
    }
    return { success: true, status: 'success', auth_token: account.auth_token, user: { id: account.id, email: account.email, name: account.name, company_name: account.company_name, website_url: account.website_url, plan: account.plan, status: account.status, is_early_bird: false } };
  }

  // Rate limiting check
  const lastPollMs = session.last_poll_at
    ? typeof session.last_poll_at === 'number'
      ? session.last_poll_at
      : new Date(session.last_poll_at).getTime()
    : 0;

  if (minIntervalMs > 0 && lastPollMs > 0) {
    if (customNow - lastPollMs < minIntervalMs) {
      return { success: false, status: 429, error: 'slow_down', retry_in: 3 };
    }
  }
  session.last_poll_at = customNow;
  session.poll_count = (session.poll_count || 0) + 1;

  // Expiration check
  const expiresTime = new Date(session.expires_at).getTime();
  if (customNow > expiresTime) {
    session.status = 'expired';
    session.updated_at = new Date(customNow).toISOString();
    syncPairingSessionLocally(session);
    return { success: false, status: 410, error: 'Session expired' };
  }

  if (session.status === 'pending') {
    syncPairingSessionLocally(session);
    return { success: true, status: 'authorization_pending', retry_in: 3 };
  }

  if (session.status === 'confirmed') {
    // ATOMIC SINGLE-USE TRANSITION TO CONSUMED (Anti-replay!)
    session.status = 'consumed';
    session.updated_at = new Date(customNow).toISOString();

    syncPairingSessionLocally(session);

    try {
      await supabase
        .from('framer_pairing_sessions')
        .update({
          status: 'consumed',
          poll_count: session.poll_count,
          last_poll_at: new Date(customNow).toISOString(),
          updated_at: session.updated_at,
        })
        .eq('device_code', deviceCode);
    } catch {
      // ignore
    }

    return {
      success: true,
      status: 'success',
      auth_token: session.auth_token,
      user: session.user_data,
    };
  }

  if (session.status === 'consumed') {
    // Anti-replay grace period: if the session was confirmed and consumed within the last 120s,
    // allow the originating device_code to reliably read the token to prevent race condition drops.
    const consumedTime = session.updated_at ? new Date(session.updated_at).getTime() : 0;
    if (customNow - consumedTime < 120000 && session.auth_token && session.user_data) {
      return {
        success: true,
        status: 'success',
        auth_token: session.auth_token,
        user: session.user_data,
      };
    }
    return {
      success: false,
      status: 410,
      error: 'Session token already consumed (replay prevented)',
    };
  }

  return { success: false, status: 400, error: 'Invalid session state' };
}

/**
 * Retrieves an active pairing session by code or device code
 */
export async function getPairingSession(
  code: string
): Promise<FramerPairingSessionRecord | null> {
  if (!code) return null;
  const cleanCode = code.trim();
  const upperCode = cleanCode.toUpperCase();

  if (process.env.NODE_ENV === 'production') {
    if (!/^(?:[a-f0-9]{64}|[A-Z]{2}-[A-Z2-9]{4})$/i.test(cleanCode)) return null;
    try {
      const { data, error } = await supabase.from('framer_pairing_sessions').select('*')
        .or(`device_code.eq.${cleanCode},user_code.eq.${upperCode}`).maybeSingle();
      return !error && data ? data as FramerPairingSessionRecord : null;
    } catch { return null; }
  }

  const memMatch =
    inMemoryPairingSessions.get(cleanCode) ||
    inMemoryPairingSessions.get(upperCode);
  if (memMatch) return memMatch;

  const list = readLocalPairingSessions();
  const fileMatch = list.find(
    (s) =>
      s.device_code === cleanCode ||
      s.user_code === cleanCode ||
      s.user_code.toUpperCase() === upperCode
  );
  if (fileMatch) return fileMatch;

  try {
    const { data } = await supabase
      .from('framer_pairing_sessions')
      .select('*')
      .or(`device_code.eq.${cleanCode},user_code.eq.${upperCode}`)
      .maybeSingle();
    if (data) return data as FramerPairingSessionRecord;
  } catch {
    // ignore
  }

  return null;
}

// -----------------------------------------------------------------------------
// OTP VERIFICATION & PASSWORD RESET TRANSPORTER & STORES
// -----------------------------------------------------------------------------

export interface OtpSession {
  email: string;
  code: string;
  expiresAt: number;
  attempts: number;
}

export interface ResetSession {
  email: string;
  code: string;
  expiresAt: number;
}

const otpStore = new Map<string, OtpSession>();
const resetStore = new Map<string, ResetSession>();

/**
 * Generates and dispatches a 6-digit email OTP verification code with branded templates.
 */
export async function sendAuthOtpCode(
  email: string,
  pluginSlug: string = 'frame-drop'
): Promise<{ success: boolean; message: string; devCode?: string }> {
  const normalizedEmail = email.toLowerCase().trim();
  const plugin = getPluginMetadata(pluginSlug);

  const code = crypto.randomInt(100000, 1000000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  // 1. In-memory storage
  otpStore.set(`${getPluginMetadata(pluginSlug).slug}:${normalizedEmail}`, {
    email: normalizedEmail,
    code,
    expiresAt,
    attempts: 0,
  });

  // 2. Persist in Supabase metadata (for existing or pending registrations)
  try {
    const { data: userRecord, error: lookupError } = await supabase
      .from('framer_users')
      .select('id, metadata')
      .eq('email', normalizedEmail)
      .eq('plugin_slug', plugin.slug)
      .maybeSingle();

    if (lookupError && requiresCommercePersistence(plugin.slug)) throw lookupError;

    if (userRecord) {
      const { data: saved, error: writeError } = await supabase
        .from('framer_users')
        .update({
          metadata: {
            ...(userRecord.metadata || {}),
            otp_code: code,
            otp_expires_at: expiresAt,
            otp_attempts: 0,
          },
        })
        .eq('id', userRecord.id).eq('plugin_slug', plugin.slug).select('id').maybeSingle();
      if (requiresCommercePersistence(plugin.slug) && (writeError || !saved)) throw new Error('Code could not be persisted.');
    } else {
      const now = new Date().toISOString();
      const { data: saved, error: writeError } = await supabase
        .from('framer_users')
        .insert({
          email: normalizedEmail,
          name: normalizedEmail.split('@')[0],
          plugin_slug: plugin.slug,
          plugin_name: plugin.name,
          plan: 'free',
          status: 'pending_verification',
          auth_token: generateFramerAuthToken(plugin.slug),
          metadata: {
            otp_code: code,
            otp_expires_at: expiresAt,
            otp_attempts: 0,
            email_verified: false,
            pending_signup: true,
          },
          created_at: now,
          updated_at: now,
          last_login_at: now,
        }).select('id').single();
      if (requiresCommercePersistence(plugin.slug) && (writeError || !saved)) throw new Error('Code could not be persisted.');
    }
  } catch (sbErr) {
    if (requiresCommercePersistence(plugin.slug)) {
      otpStore.delete(`${plugin.slug}:${normalizedEmail}`);
      return { success: false, message: 'Account database unavailable. Please try again.' };
    }
    console.warn('[OTP Store] Supabase sync notice:', sbErr);
  }

  // Also sync locally to guarantee cross-worker persistence
  try {
    const localUsers = readLocalUsers();
    const existingLocal = localUsers.find(
      (u) => u.email === normalizedEmail && u.plugin_slug === plugin.slug
    );
    if (existingLocal) {
      existingLocal.metadata = {
        ...(existingLocal.metadata || {}),
        otp_code: code,
        otp_expires_at: expiresAt,
        otp_attempts: 0,
      };
      syncUserLocally(existingLocal);
    } else {
      const now = new Date().toISOString();
      syncUserLocally({
        id: crypto.randomUUID(),
        email: normalizedEmail,
        name: normalizedEmail.split('@')[0],
        company_name: '',
        website_url: '',
        plugin_slug: plugin.slug,
        plugin_name: plugin.name,
        plan: 'free',
        auth_token: generateFramerAuthToken(plugin.slug),
        status: 'pending_verification',
        is_early_bird: false,
        metadata: {
          otp_code: code,
          otp_expires_at: expiresAt,
          otp_attempts: 0,
          email_verified: false,
          pending_signup: true,
        },
        created_at: now,
        updated_at: now,
        last_login_at: now,
      } as FramerUserRecord);
    }
  } catch {
    // ignore
  }

  // 3. Dispatch branded verification email via direct Mailgun SMTP
  try {
    await sendVerificationEmail(normalizedEmail, code, undefined, plugin.slug);
    return {
      success: true,
      message: `A 6-digit verification code has been sent to ${normalizedEmail}.`,
      devCode: process.env.NODE_ENV !== 'production' ? code : undefined,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'SMTP delivery error';
    console.error('[Mail Error] Could not deliver OTP email via direct SMTP:', err);
    return {
      success: false,
      message: `Failed to deliver verification email to ${normalizedEmail}: ${msg}`,
    };
  }
}

/**
 * Validates a submitted 6-digit OTP code against memory and Supabase session stores.
 */
export async function verifyAuthOtpCode(
  email: string,
  code: string,
  pluginSlug: string = 'frame-drop'
): Promise<{ valid: boolean; message?: string }> {
  if (process.env.NODE_ENV === 'production') {
    const { data, error } = await supabase.rpc('auth_verify_code', { p_email: email, p_plugin: getPluginMetadata(pluginSlug).slug, p_code: code.trim(), p_kind: 'otp' });
    return !error && data === true ? { valid: true } : { valid: false, message: 'Invalid or expired verification code.' };
  }
  const normalizedEmail = email.toLowerCase().trim();
  const cleanCode = code.trim();
  let session = otpStore.get(`${getPluginMetadata(pluginSlug).slug}:${normalizedEmail}`);

  // Cross-instance fallback to Supabase if not in memory
  if (!session) {
    try {
      const plugin = getPluginMetadata(pluginSlug);
      const { data: userRecord } = await supabase
        .from('framer_users')
        .select('id, metadata')
        .eq('email', normalizedEmail)
        .eq('plugin_slug', plugin.slug)
        .maybeSingle();

      if (userRecord && userRecord.metadata?.otp_code && userRecord.metadata?.otp_expires_at) {
        session = {
          email: normalizedEmail,
          code: String(userRecord.metadata.otp_code),
          expiresAt: Number(userRecord.metadata.otp_expires_at),
          attempts: Number(userRecord.metadata.otp_attempts || 0),
        };
      }
    } catch {
      // ignore
    }
  }

  // Local fallback if neither memory nor Supabase returned a session
  if (!session) {
    try {
      const plugin = getPluginMetadata(pluginSlug);
      const localUsers = readLocalUsers();
      const localMatch = localUsers.find(
        (u) => u.email === normalizedEmail && u.plugin_slug === plugin.slug
      );
      if (localMatch && localMatch.metadata?.otp_code && localMatch.metadata?.otp_expires_at) {
        session = {
          email: normalizedEmail,
          code: String(localMatch.metadata.otp_code),
          expiresAt: Number(localMatch.metadata.otp_expires_at),
          attempts: Number(localMatch.metadata.otp_attempts || 0),
        };
      }
    } catch {
      // ignore
    }
  }

  if (!session) {
    return {
      valid: false,
      message: 'No active verification code found for this email. Please request a new code.',
    };
  }

  if (Date.now() > session.expiresAt) {
    otpStore.delete(`${getPluginMetadata(pluginSlug).slug}:${normalizedEmail}`);
    return {
      valid: false,
      message: 'Verification code has expired. Please request a new code.',
    };
  }

  session.attempts += 1;
  if (session.attempts > 5) {
    otpStore.delete(`${getPluginMetadata(pluginSlug).slug}:${normalizedEmail}`);
    return {
      valid: false,
      message: 'Too many incorrect attempts. Please request a new verification code.',
    };
  }

  if (session.code !== cleanCode) {
    return {
      valid: false,
      message: 'Invalid verification code. Please check and try again.',
    };
  }

  // Code is valid - consume
  otpStore.delete(`${getPluginMetadata(pluginSlug).slug}:${normalizedEmail}`);
  try {
    const plugin = getPluginMetadata(pluginSlug);
    const { data: userRecord } = await supabase
      .from('framer_users')
      .select('id, metadata')
      .eq('email', normalizedEmail)
      .eq('plugin_slug', plugin.slug)
      .maybeSingle();

    if (userRecord) {
      const updatedMeta = { ...(userRecord.metadata || {}) };
      delete updatedMeta.otp_code;
      delete updatedMeta.otp_expires_at;
      delete updatedMeta.otp_attempts;
      await supabase
        .from('framer_users')
        .update({ metadata: updatedMeta })
        .eq('id', userRecord.id);
    }

    const localUsers = readLocalUsers();
    const localMatch = localUsers.find(
      (u) => u.email === normalizedEmail && u.plugin_slug === plugin.slug
    );
    if (localMatch && localMatch.metadata) {
      delete localMatch.metadata.otp_code;
      delete localMatch.metadata.otp_expires_at;
      delete localMatch.metadata.otp_attempts;
      syncUserLocally(localMatch);
    }
  } catch {
    // ignore
  }

  return { valid: true };
}

/**
 * Generates and sends a 6-digit password reset code to the user's email.
 */
export async function requestAuthPasswordReset(
  email: string,
  pluginSlug: string = 'frame-drop'
): Promise<{ success: boolean; message: string; devCode?: string }> {
  const normalizedEmail = email.toLowerCase().trim();
  const plugin = getPluginMetadata(pluginSlug);

  const code = crypto.randomInt(100000,1000000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

  resetStore.set(`${getPluginMetadata(pluginSlug).slug}:${normalizedEmail}`, {
    email: normalizedEmail,
    code,
    expiresAt,
  });

  // Persist in Supabase metadata if user exists
  let userName: string | undefined;
  try {
    const { data: userRecord, error: lookupError } = await supabase
      .from('framer_users')
      .select('id, name, metadata')
      .eq('email', normalizedEmail)
      .eq('plugin_slug', plugin.slug)
      .maybeSingle();

    if (lookupError && requiresCommercePersistence(plugin.slug)) throw lookupError;

    if (userRecord) {
      userName = userRecord.name;
      const { data: saved, error: writeError } = await supabase
        .from('framer_users')
        .update({
          metadata: {
            ...(userRecord.metadata || {}),
            reset_code: code,
            reset_expires_at: expiresAt,
            reset_attempts: 0,
          },
        })
        .eq('id', userRecord.id).eq('plugin_slug', plugin.slug).select('id').maybeSingle();
      if (requiresCommercePersistence(plugin.slug) && (writeError || !saved)) throw new Error('Code could not be persisted.');
    }
  } catch (sbErr) {
    if (requiresCommercePersistence(plugin.slug)) {
      resetStore.delete(`${plugin.slug}:${normalizedEmail}`);
      return { success: false, message: 'Account database unavailable. Please try again.' };
    }
    console.warn('[Reset Store] Supabase sync notice:', sbErr);
  }

  // Dispatch branded password reset email via direct Mailgun SMTP
  try {
    await sendPasswordResetEmail(normalizedEmail, code, userName, plugin.slug);
    return {
      success: true,
      message: `Password reset instructions sent to ${normalizedEmail}.`,
      devCode: process.env.NODE_ENV !== 'production' ? code : undefined,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'SMTP delivery error';
    console.error('[Mail Error] Could not deliver password reset email via SMTP:', err);
    return {
      success: false,
      message: `Failed to deliver reset email to ${normalizedEmail}: ${msg}`,
    };
  }
}

/**
 * Verifies reset code and updates the password for a Framer user.
 */
export async function resetAuthUserPassword(
  email: string,
  code: string,
  newPassword: string,
  pluginSlug: string = 'frame-drop'
): Promise<{
  success: boolean;
  message: string;
  user?: FramerUserRecord;
  token?: string;
}> {
  if (process.env.NODE_ENV === 'production') {
    const { data, error } = await supabase.rpc('auth_verify_code', { p_email: email, p_plugin: getPluginMetadata(pluginSlug).slug, p_code: code.trim(), p_kind: 'reset' });
    if(error || data !== true) return { success: false, message: 'Invalid or expired reset code.' };
    resetStore.set(`${getPluginMetadata(pluginSlug).slug}:${email.toLowerCase().trim()}`, { email: email.toLowerCase().trim(), code: code.trim(), expiresAt: Date.now()+60000 });
  }
  const normalizedEmail = email.toLowerCase().trim();
  const cleanCode = code.trim();
  let session = resetStore.get(`${getPluginMetadata(pluginSlug).slug}:${normalizedEmail}`);

  // If not in memory, check Supabase metadata
  if (!session) {
    try {
      const plugin = getPluginMetadata(pluginSlug);
      const { data: userRecord } = await supabase
        .from('framer_users')
        .select('id, metadata')
        .eq('email', normalizedEmail)
        .eq('plugin_slug', plugin.slug)
        .maybeSingle();

      if (userRecord && userRecord.metadata?.reset_code && userRecord.metadata?.reset_expires_at) {
        session = {
          email: normalizedEmail,
          code: String(userRecord.metadata.reset_code),
          expiresAt: Number(userRecord.metadata.reset_expires_at),
        };
      }
    } catch {
      // ignore
    }
  }

  if (!session) {
    return {
      success: false,
      message: 'No active password reset request found. Please request a new code.',
    };
  }

  if (Date.now() > session.expiresAt) {
    resetStore.delete(`${getPluginMetadata(pluginSlug).slug}:${normalizedEmail}`);
    return {
      success: false,
      message: 'Reset code has expired. Please request a new code.',
    };
  }

  if (session.code !== cleanCode) {
    return {
      success: false,
      message: 'Invalid reset code. Please check the code sent to your email.',
    };
  }

  const salt = 'qubtic_pwd_salt_';
  const passwordHash = hashPassword(newPassword);

  resetStore.delete(`${getPluginMetadata(pluginSlug).slug}:${normalizedEmail}`);
  const plugin = getPluginMetadata(pluginSlug);
  const account = await findFramerUser(normalizedEmail, plugin.slug);
  if (!account || account.status !== 'active') return { success: false, message: 'Account is not active.' };
  const cleanMetadata = { ...(account.metadata || {}) };
  delete cleanMetadata.reset_code;
  delete cleanMetadata.reset_expires_at;
  const { error: resetError } = await supabase.from('framer_users').update({ metadata: cleanMetadata }).eq('id', account.id).eq('plugin_slug', plugin.slug);
  if (resetError && isCommercePlugin(plugin.slug)) return { success: false, message: 'Could not reset password. Try again.' };
  syncUserLocally({ ...account, metadata: cleanMetadata });

  const result = await createOrUpdateFramerUser({
    email: normalizedEmail,
    pluginSlug,
    metadata: {
      password_hash: passwordHash,
      password_updated_at: new Date().toISOString(),
    },
  });

  return {
    success: true,
    message: 'Your password has been successfully reset.',
    user: result.user,
    token: result.token,
  };
}

/** Revoke the current Commerce account token. Pairing snapshots cannot restore it. */
export async function revokeCommerceSession(token: string): Promise<void> {
  if (!token) return;
  const user = await verifyFramerSessionToken(token);
  if (!user || !isCommercePlugin(user.plugin_slug)) return;
  const replacement = generateFramerAuthToken(user.plugin_slug);
  const { error } = await supabase.from('framer_users').update({ auth_token: replacement }).eq('id', user.id).eq('auth_token', token).eq('plugin_slug', user.plugin_slug);
  if (error) throw new Error('Could not sign out. Try again.');
  syncUserLocally({ ...user, auth_token: replacement });
}
