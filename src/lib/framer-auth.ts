import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { supabase } from './supabase';
import { getPluginMetadata } from './plugins-registry';

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
  plan: 'free' | 'pro' | 'enterprise' | 'trial';
  auth_token: string;
  status: 'active' | 'inactive' | 'suspended';
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  last_login_at: string;
  is_early_bird?: boolean;
  early_bird_granted_at?: string;
}

export const EARLY_BIRD_CUTOFF_DATE = process.env.EARLY_BIRD_CUTOFF_DATE || '2026-12-31T23:59:59.999Z';
export const PAIRING_TTL_SECONDS = 600; // 10 minutes
export const PAIRING_POLL_INTERVAL_SECONDS = 3;

/**
 * Evaluates Early Bird Pro entitlement status based on registration timestamp.
 */
export function evaluateEarlyBirdStatus(
  registrationTimestamp?: string | number | Date,
  cutoffDate: string = EARLY_BIRD_CUTOFF_DATE
): {
  plan: 'free' | 'pro';
  is_early_bird: boolean;
  early_bird_cutoff: string;
} {
  const regDate = registrationTimestamp ? new Date(registrationTimestamp) : new Date();
  const cutoff = new Date(cutoffDate);
  const isEarlyBird = regDate.getTime() <= cutoff.getTime();
  return {
    plan: isEarlyBird ? 'pro' : 'free',
    is_early_bird: isEarlyBird,
    early_bird_cutoff: cutoff.toISOString(),
  };
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
  plan?: 'free' | 'pro' | 'enterprise' | 'trial';
  metadata?: Record<string, unknown>;
}): Promise<{ user: FramerUserRecord; isNew: boolean; token: string }> {
  const normalizedEmail = params.email.toLowerCase().trim();
  const pluginSlug = params.pluginSlug.toLowerCase().trim();
  const plugin = getPluginMetadata(pluginSlug);
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

        // Evaluate Early Bird Pro entitlement for existing user
        const wasEarlyBird =
          existing.is_early_bird === true ||
          Boolean(
            existing.created_at &&
              new Date(existing.created_at).getTime() <= new Date(EARLY_BIRD_CUTOFF_DATE).getTime()
          );
        const resolvedPlan = wasEarlyBird ? 'pro' : existing.plan || params.plan || 'free';
        const resolvedIsEarlyBird = Boolean(wasEarlyBird);
        const resolvedEarlyBirdGrantedAt = wasEarlyBird
          ? existing.early_bird_granted_at || existing.created_at || now
          : undefined;

        const dbUpdatePayload = {
          name: params.name || existing.name || '',
          company_name: companyToSave,
          website_url: websiteToSave,
          plugin_name: plugin.name,
          auth_token: token,
          plan: resolvedPlan,
          last_login_at: now,
          updated_at: now,
          framer_user_id: params.framerUserId || existing.framer_user_id,
          framer_project_id: params.framerProjectId || existing.framer_project_id,
          metadata: {
            ...(existing.metadata || {}),
            ...(params.metadata || {}),
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
          return { user: userWithAttrs, isNew: false, token };
        } else if (updateErr) {
          console.warn('Supabase framer_users update error:', updateErr);
        }
      } else {
        // Create brand new user
        const earlyBird = evaluateEarlyBirdStatus(now, EARLY_BIRD_CUTOFF_DATE);
        const assignedPlan = earlyBird.is_early_bird ? 'pro' : params.plan || 'free';

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
          return { user: userWithAttrs, isNew: true, token };
        } else if (insertErr) {
          console.warn('Supabase framer_users insert error:', insertErr);
        }
      }
    }
  } catch (sbErr) {
    console.warn('Supabase framer_users query failed, falling back to local store:', sbErr);
  }

  // 2. Local Fallback (ensures zero crashes if Supabase table is not yet migrated)
  const localList = readLocalUsers();
  const existingIdx = localList.findIndex(
    (u) => u.email === normalizedEmail && u.plugin_slug === pluginSlug
  );

  if (existingIdx >= 0) {
    const existing = localList[existingIdx];
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
    existing.last_login_at = now;
    existing.updated_at = now;
    if (params.framerUserId) existing.framer_user_id = params.framerUserId;
    if (params.framerProjectId) existing.framer_project_id = params.framerProjectId;

    const wasEarlyBird =
      existing.is_early_bird === true ||
      Boolean(
        existing.created_at &&
          new Date(existing.created_at).getTime() <= new Date(EARLY_BIRD_CUTOFF_DATE).getTime()
      );
    existing.plan = wasEarlyBird ? 'pro' : existing.plan || params.plan || 'free';
    existing.is_early_bird = Boolean(wasEarlyBird);
    if (wasEarlyBird) {
      existing.early_bird_granted_at =
        existing.early_bird_granted_at || existing.created_at || now;
    }

    existing.metadata = {
      ...(existing.metadata || {}),
      ...(params.metadata || {}),
      ...(hasValidCompany ? { company_name: existing.company_name } : {}),
      ...(hasValidWebsite ? { website_url: existing.website_url } : {}),
      is_early_bird: existing.is_early_bird,
      ...(existing.early_bird_granted_at
        ? { early_bird_granted_at: existing.early_bird_granted_at }
        : {}),
    };

    localList[existingIdx] = existing;
    writeLocalUsers(localList);
    return { user: existing, isNew: false, token };
  } else {
    const earlyBird = evaluateEarlyBirdStatus(now, EARLY_BIRD_CUTOFF_DATE);
    const assignedPlan = earlyBird.is_early_bird ? 'pro' : params.plan || 'free';

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
  if (user.is_early_bird === undefined) {
    const isEarly = Boolean(
      user.created_at &&
        new Date(user.created_at).getTime() <= new Date(EARLY_BIRD_CUTOFF_DATE).getTime()
    );
    user.is_early_bird = isEarly;
    if (isEarly) {
      if (user.plan === 'free') {
        user.plan = 'pro';
      }
      user.early_bird_granted_at = user.early_bird_granted_at || user.created_at;
    }
  }
  return user;
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

  // 1. Check Supabase
  try {
    let query = supabase.from('framer_users').select('*').eq('auth_token', token);
    if (expectedPlugin) {
      query = query.eq('plugin_slug', expectedPlugin.toLowerCase().trim());
    }
    const { data, error } = await query.maybeSingle();
    if (!error && data) {
      return ensureEarlyBirdAttributes(data as FramerUserRecord);
    }
  } catch (_err) {
    // Fall back to local
  }

  // 2. Check local fallback
  const localList = readLocalUsers();
  const match = localList.find((u) => {
    if (u.auth_token !== token) return false;
    if (expectedPlugin && u.plugin_slug !== expectedPlugin.toLowerCase().trim()) return false;
    return true;
  });

  return match ? ensureEarlyBirdAttributes(match) : null;
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
    proCount: allUsers.filter((u) => u.plan === 'pro' || u.plan === 'enterprise').length,
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
  const pluginSlug = (params?.pluginSlug || 'frame-drop').toLowerCase().trim();
  const pluginMeta = getPluginMetadata(pluginSlug);
  const pluginName = params?.pluginName || pluginMeta.name;

  // Clamp TTL between 60s and 3600s, default 600s (RFC 8628 timing contracts)
  const requestedTtl = params?.ttlSeconds ?? PAIRING_TTL_SECONDS;
  const ttlSeconds = Math.max(60, Math.min(requestedTtl, 3600));

  const deviceCode = crypto.randomBytes(32).toString('hex'); // 256-bit entropy = 64 hex chars
  const userCode = generateUserCode('FD');
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

  // Cache in-memory and write to local JSON store
  syncPairingSessionLocally(sessionRecord);

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
      console.warn('Supabase framer_pairing_sessions insert error:', sbErr);
    }
  } catch (sbEx) {
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
  try {
    const { data, error } = await supabase
      .from('framer_pairing_sessions')
      .select('*')
      .eq('user_code', normalizedCode)
      .maybeSingle();
    if (!error && data) {
      session = data as FramerPairingSessionRecord;
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

  const expiresTime = new Date(session.expires_at).getTime();
  if (customNow > expiresTime) {
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
        plan: user.plan || 'pro',
        is_early_bird: Boolean(user.is_early_bird),
        status: user.status || 'active',
      }
    : null;
  session.updated_at = new Date(customNow).toISOString();

  // Persist locally
  syncPairingSessionLocally(session);

  try {
    const { error: sbUpdateErr } = await supabase
      .from('framer_pairing_sessions')
      .update({
        status: 'confirmed',
        auth_token: session.auth_token,
        user_data: session.user_data,
        updated_at: session.updated_at,
      })
      .eq('user_code', normalizedCode);
    if (sbUpdateErr) {
      console.warn('Supabase pairing confirm error:', sbUpdateErr);
    }
  } catch (sbErr) {
    console.warn('Supabase pairing confirm exception:', sbErr);
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
  try {
    const { data, error } = await supabase
      .from('framer_pairing_sessions')
      .select('*')
      .eq('device_code', deviceCode)
      .maybeSingle();
    if (!error && data) {
      session = data as FramerPairingSessionRecord;
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

function getAuthEmailTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.mailgun.org';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

/**
 * Generates and dispatches a 6-digit email OTP verification code.
 */
export async function sendAuthOtpCode(
  email: string,
  pluginSlug: string = 'frame-drop'
): Promise<{ success: boolean; message: string; devCode?: string }> {
  const normalizedEmail = email.toLowerCase().trim();
  const plugin = getPluginMetadata(pluginSlug);

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore.set(normalizedEmail, {
    email: normalizedEmail,
    code,
    expiresAt,
    attempts: 0,
  });

  const fromEmail = process.env.SMTP_FROM_EMAIL || 'hello@qubtic.tech';
  const fromName = process.env.SMTP_FROM_NAME || 'Qubtic Auth';

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to: normalizedEmail,
    subject: `Your ${plugin.name} Verification Code: ${code}`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #070D09; padding: 32px; color: #FFFFFF;">
        <div style="max-width: 520px; margin: 0 auto; background: #0A130D; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px;">
          <h2 style="color: #A6FF00; margin-top: 0; font-size: 22px;">${plugin.name} Verification</h2>
          <p style="font-size: 14px; color: #8E968F; line-height: 1.6;">
            Use the 6-digit one-time code below to verify your account and complete login in Framer:
          </p>
          <div style="margin: 24px 0; padding: 18px; background: rgba(0,0,0,0.6); border: 1px solid rgba(166,255,0,0.3); border-radius: 12px; text-align: center; font-size: 32px; letter-spacing: 6px; font-weight: bold; color: #A6FF00; font-family: monospace;">
            ${code}
          </div>
          <p style="font-size: 12px; color: #5C635D; margin-bottom: 0;">
            This verification code expires in 10 minutes. If you did not request this login code, you can safely ignore this email.
          </p>
        </div>
      </div>
    `,
  };

  try {
    const transporter = getAuthEmailTransporter();
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.warn('[Mail Warning] Could not deliver OTP email via direct SMTP:', err);
  }

  return {
    success: true,
    message: `Verification code sent to ${normalizedEmail}.`,
    devCode: process.env.NODE_ENV !== 'production' ? code : undefined,
  };
}

/**
 * Validates a submitted 6-digit OTP code against the active session.
 */
export async function verifyAuthOtpCode(
  email: string,
  code: string
): Promise<{ valid: boolean; message?: string }> {
  const normalizedEmail = email.toLowerCase().trim();
  const session = otpStore.get(normalizedEmail);

  if (!session) {
    return {
      valid: false,
      message: 'No active verification code found for this email. Please request a new code.',
    };
  }

  if (Date.now() > session.expiresAt) {
    otpStore.delete(normalizedEmail);
    return {
      valid: false,
      message: 'Verification code has expired. Please request a new code.',
    };
  }

  session.attempts += 1;
  if (session.attempts > 5) {
    otpStore.delete(normalizedEmail);
    return {
      valid: false,
      message: 'Too many incorrect attempts. Please request a new verification code.',
    };
  }

  if (session.code !== code.trim()) {
    return {
      valid: false,
      message: 'Invalid verification code. Please check and try again.',
    };
  }

  // Code is valid - consume
  otpStore.delete(normalizedEmail);
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

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

  resetStore.set(normalizedEmail, {
    email: normalizedEmail,
    code,
    expiresAt,
  });

  const fromEmail = process.env.SMTP_FROM_EMAIL || 'hello@qubtic.tech';
  const fromName = process.env.SMTP_FROM_NAME || 'Qubtic Auth';

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to: normalizedEmail,
    subject: `Reset Your Password for ${plugin.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #070D09; padding: 32px; color: #FFFFFF;">
        <div style="max-width: 520px; margin: 0 auto; background: #0A130D; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px;">
          <h2 style="color: #A6FF00; margin-top: 0; font-size: 22px;">Password Reset Request</h2>
          <p style="font-size: 14px; color: #8E968F; line-height: 1.6;">
            We received a request to reset your password for <strong>${plugin.name}</strong>. Enter the 6-digit confirmation code below to choose a new password:
          </p>
          <div style="margin: 24px 0; padding: 18px; background: rgba(0,0,0,0.6); border: 1px solid rgba(166,255,0,0.3); border-radius: 12px; text-align: center; font-size: 32px; letter-spacing: 6px; font-weight: bold; color: #A6FF00; font-family: monospace;">
            ${code}
          </div>
          <p style="font-size: 12px; color: #5C635D; margin-bottom: 0;">
            This reset code is valid for 15 minutes. If you did not make this request, you can safely disregard this message.
          </p>
        </div>
      </div>
    `,
  };

  try {
    const transporter = getAuthEmailTransporter();
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.warn('[Mail Warning] Could not deliver password reset email via SMTP:', err);
  }

  return {
    success: true,
    message: `Password reset instructions sent to ${normalizedEmail}.`,
    devCode: process.env.NODE_ENV !== 'production' ? code : undefined,
  };
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
  const normalizedEmail = email.toLowerCase().trim();
  const session = resetStore.get(normalizedEmail);

  if (!session) {
    return {
      success: false,
      message: 'No active password reset request found. Please request a new code.',
    };
  }

  if (Date.now() > session.expiresAt) {
    resetStore.delete(normalizedEmail);
    return {
      success: false,
      message: 'Reset code has expired. Please request a new code.',
    };
  }

  if (session.code !== code.trim()) {
    return {
      success: false,
      message: 'Invalid reset code. Please check the code sent to your email.',
    };
  }

  const salt = 'qubtic_pwd_salt_';
  const passwordHash = crypto.createHash('sha256').update(salt + newPassword).digest('hex');

  resetStore.delete(normalizedEmail);

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
