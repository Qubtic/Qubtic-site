import { NextResponse } from 'next/server';
import { createOrUpdateFramerUser, generateSessionCode } from '@/lib/framer-auth';
import { getPluginMetadata } from '@/lib/plugins-registry';

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email') || '';

  const defaultTeams = [
    {
      id: 'team_personal',
      name: email ? `${email.split('@')[0]}'s Workspace` : 'Personal Workspace',
      role: 'Owner',
      tier: 'Pro',
      membersCount: 1,
      isDefault: true,
    },
    {
      id: 'team_agency',
      name: 'Design Studio & Agency Hub',
      role: 'Admin',
      tier: 'Enterprise Team',
      membersCount: 8,
      isDefault: false,
    },
    {
      id: 'team_marketing',
      name: 'Growth & Brand Marketing Team',
      role: 'Editor',
      tier: 'Team',
      membersCount: 5,
      isDefault: false,
    },
  ];

  return NextResponse.json(
    {
      success: true,
      teams: defaultTeams,
    },
    {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
    }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      name,
      teamId = 'team_personal',
      teamName = 'Personal Workspace',
      teamRole = 'Owner',
      plugin = 'frame-drop',
      framerUserId,
      framerProjectId,
      plan = 'pro',
    } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'A valid email address is required.' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const pluginMeta = getPluginMetadata(plugin);

    const { user, isNew, token } = await createOrUpdateFramerUser({
      email,
      name: name || email.split('@')[0],
      pluginSlug: pluginMeta.slug,
      framerUserId,
      framerProjectId,
      plan,
      metadata: {
        team_id: teamId,
        team_name: teamName,
        team_role: teamRole,
        authMode: 'team_switch',
        clientIp: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        authenticatedVia: 'Qubtic Auth Team Switcher',
      },
    });

    const sessionCode = generateSessionCode();

    return NextResponse.json(
      {
        success: true,
        message: `Switched active workspace to "${teamName}".`,
        token,
        sessionCode,
        isNew,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          company_name: user.company_name,
          website_url: user.website_url,
          plan: user.plan,
          plugin_slug: user.plugin_slug,
          plugin_name: user.plugin_name,
          status: user.status,
          created_at: user.created_at,
          last_login_at: user.last_login_at,
          team_id: teamId,
          team_name: teamName,
          team_role: teamRole,
        },
        plugin: {
          slug: pluginMeta.slug,
          name: pluginMeta.name,
          version: pluginMeta.version,
        },
      },
      {
        status: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    );
  } catch (error) {
    console.error('Error in team selection auth route:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error processing team selection.' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
