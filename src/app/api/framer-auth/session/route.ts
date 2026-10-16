import { NextResponse } from 'next/server';
import { createOrUpdateFramerUser, generateSessionCode } from '@/lib/framer-auth';
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
      name,
      plugin = 'qube-auth',
      framerUserId,
      framerProjectId,
      metadata = {},
      plan = 'free',
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

    // Save or update in database
    const { user, isNew, token } = await createOrUpdateFramerUser({
      email,
      name,
      pluginSlug: pluginMeta.slug,
      framerUserId,
      framerProjectId,
      plan,
      metadata: {
        ...metadata,
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
          plan: user.plan,
          plugin_slug: user.plugin_slug,
          plugin_name: user.plugin_name,
          status: user.status,
          created_at: user.created_at,
          last_login_at: user.last_login_at,
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
