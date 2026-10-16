import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createOrUpdateFramerUser, findFramerUser, generateSessionCode } from '@/lib/framer-auth';
import { getPluginMetadata } from '@/lib/plugins-registry';

// Handle CORS Preflight for Framer Plugins
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-framer-token, x-plugin-slug',
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      name,
      company_name,
      companyName,
      website_url,
      websiteUrl,
      plugin = 'qube-auth',
      framerUserId,
      framerProjectId,
      metadata = {},
      plan = 'free',
      mode = 'signin',
      teamName,
      team_name,
      teamRole,
      team_role,
    } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'A valid email address is required.' },
        {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    const pluginMeta = getPluginMetadata(plugin);

    const rawCompany = typeof company_name === 'string' ? company_name : (typeof companyName === 'string' ? companyName : '');
    const resolvedCompany = rawCompany.trim().length > 0 ? rawCompany.trim() : undefined;

    const rawWebsite = typeof website_url === 'string' ? website_url : (typeof websiteUrl === 'string' ? websiteUrl : '');
    const resolvedWebsite = rawWebsite.trim().length > 0 ? rawWebsite.trim() : undefined;

    const resolvedTeamName = team_name || teamName || '';
    const resolvedTeamRole = team_role || teamRole || 'owner';

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await findFramerUser(normalizedEmail, pluginMeta.slug);

    // On sign-in: verify password against stored metadata.password_hash if it exists
    if (existingUser?.metadata && typeof existingUser.metadata.password_hash === 'string') {
      const storedHash = existingUser.metadata.password_hash;
      const submittedPassword = typeof password === 'string' ? password : '';
      const directHash = crypto.createHash('sha256').update(submittedPassword).digest('hex');
      const saltedHash = crypto.createHash('sha256').update('qubtic_pwd_salt_' + submittedPassword).digest('hex');

      if (storedHash !== directHash && storedHash !== saltedHash) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid email or password',
            message: 'Invalid email or password',
          },
          {
            status: 401,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-framer-token',
            },
          }
        );
      }
    }

    // On sign-up (or new user creation): hash password if provided
    let passwordHash: string | undefined = undefined;
    if ((mode === 'signup' || !existingUser) && typeof password === 'string' && password.length > 0) {
      passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    }

    // Save or update in database
    const { user, isNew, token } = await createOrUpdateFramerUser({
      email,
      name,
      company_name: resolvedCompany,
      website_url: resolvedWebsite,
      pluginSlug: pluginMeta.slug,
      framerUserId,
      framerProjectId,
      plan,
      metadata: {
        ...metadata,
        ...(resolvedCompany ? { company_name: resolvedCompany } : {}),
        ...(resolvedWebsite ? { website_url: resolvedWebsite } : {}),
        ...(resolvedTeamName ? { team_name: resolvedTeamName } : {}),
        team_role: resolvedTeamRole,
        authMode: mode,
        ...(passwordHash ? { password_hash: passwordHash } : {}),
        clientIp: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        authenticatedVia: 'Qubtic Auth Portal',
      },
    });

    const sessionCode = generateSessionCode();

    return NextResponse.json(
      {
        success: true,
        message: isNew
          ? `Welcome to ${pluginMeta.name}! Account created successfully.`
          : `Welcome back to ${pluginMeta.name}!`,
        token,
        sessionCode,
        isNew,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          company_name: user.company_name || resolvedCompany,
          website_url: user.website_url || resolvedWebsite,
          plan: user.plan,
          plugin_slug: user.plugin_slug,
          plugin_name: user.plugin_name,
          status: user.status,
          created_at: user.created_at,
          last_login_at: user.last_login_at,
          team_name: resolvedTeamName || undefined,
          team_role: resolvedTeamRole || undefined,
        },
        plugin: {
          slug: pluginMeta.slug,
          name: pluginMeta.name,
          version: pluginMeta.version,
        },
      },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-framer-token',
        },
      }
    );
  } catch (error) {
    console.error('Error creating Framer user session:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error processing authentication.' },
      {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    );
  }
}
