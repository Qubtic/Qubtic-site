import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { supabase } from './supabase';
import { getPluginMetadata } from './plugins-registry';

export interface FramerUserRecord {
  id: string;
  email: string;
  name?: string;
  plugin_slug: string;
  plugin_name: string;
  framer_user_id?: string;
  framer_project_id?: string;
  plan: 'free' | 'pro' | 'enterprise' | 'trial';
  auth_token: string;
  status: 'active' | 'inactive' | 'suspended';
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  last_login_at: string;
}

const STORE_DIR = path.join(process.cwd(), 'src', 'data', 'store');
const FALLBACK_FILE = path.join(STORE_DIR, 'framer_users.json');

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
 * Creates or updates a user for a given Framer plugin.
 * Checks Supabase first; if table doesn't exist yet, saves locally.
 */
export async function createOrUpdateFramerUser(params: {
  email: string;
  name?: string;
  pluginSlug: string;
  framerUserId?: string;
  framerProjectId?: string;
  plan?: 'free' | 'pro' | 'enterprise' | 'trial';
  metadata?: Record<string, any>;
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
        const updatedRecord: Partial<FramerUserRecord> = {
          name: params.name || existing.name || '',
          plugin_name: plugin.name,
          auth_token: token,
          last_login_at: now,
          updated_at: now,
          framer_user_id: params.framerUserId || existing.framer_user_id,
          framer_project_id: params.framerProjectId || existing.framer_project_id,
          metadata: {
            ...(existing.metadata || {}),
            ...(params.metadata || {}),
          },
        };

        const { data: updated, error: updateErr } = await supabase
          .from('framer_users')
          .update(updatedRecord)
          .eq('id', existing.id)
          .select()
          .single();

        if (!updateErr && updated) {
          // Sync locally as backup
          syncUserLocally(updated as FramerUserRecord);
          return { user: updated as FramerUserRecord, isNew: false, token };
        }
      } else {
        // Create brand new user
        const newRecord: Omit<FramerUserRecord, 'id'> = {
          email: normalizedEmail,
          name: params.name || normalizedEmail.split('@')[0],
          plugin_slug: pluginSlug,
          plugin_name: plugin.name,
          framer_user_id: params.framerUserId || '',
          framer_project_id: params.framerProjectId || '',
          plan: params.plan || 'free',
          auth_token: token,
          status: 'active',
          metadata: params.metadata || {},
          created_at: now,
          updated_at: now,
          last_login_at: now,
        };

        const { data: created, error: insertErr } = await supabase
          .from('framer_users')
          .insert(newRecord)
          .select()
          .single();

        if (!insertErr && created) {
          syncUserLocally(created as FramerUserRecord);
          return { user: created as FramerUserRecord, isNew: true, token };
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
    existing.auth_token = token;
    existing.last_login_at = now;
    existing.updated_at = now;
    if (params.framerUserId) existing.framer_user_id = params.framerUserId;
    if (params.framerProjectId) existing.framer_project_id = params.framerProjectId;
    existing.metadata = { ...(existing.metadata || {}), ...(params.metadata || {}) };

    localList[existingIdx] = existing;
    writeLocalUsers(localList);
    return { user: existing, isNew: false, token };
  } else {
    const newRecord: FramerUserRecord = {
      id: crypto.randomUUID(),
      email: normalizedEmail,
      name: params.name || normalizedEmail.split('@')[0],
      plugin_slug: pluginSlug,
      plugin_name: plugin.name,
      framer_user_id: params.framerUserId || '',
      framer_project_id: params.framerProjectId || '',
      plan: params.plan || 'free',
      auth_token: token,
      status: 'active',
      metadata: params.metadata || {},
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
      return data as FramerUserRecord;
    }
  } catch (err) {
    // Fall back to local
  }

  // 2. Check local fallback
  const localList = readLocalUsers();
  const match = localList.find((u) => {
    if (u.auth_token !== token) return false;
    if (expectedPlugin && u.plugin_slug !== expectedPlugin.toLowerCase().trim()) return false;
    return true;
  });

  return match || null;
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
    let query = supabase
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
