import { NextResponse } from 'next/server';
import {
  requestAuthPasswordReset,
  resetAuthUserPassword,
  generateSessionCode,
} from '@/lib/framer-auth';
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      action = 'request',
      email,
      code,
      newPassword,
      plugin = 'frame-drop',
    } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'A valid email address is required.' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const pluginMeta = getPluginMetadata(plugin);

    if (action === 'request') {
      const result = await requestAuthPasswordReset(email, pluginMeta.slug);
      return NextResponse.json(result, {
        status: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (action === 'reset') {
      if (!code || typeof code !== 'string') {
        return NextResponse.json(
          { success: false, message: 'A 6-digit reset code is required.' },
          { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
        );
      }

      if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
        return NextResponse.json(
          { success: false, message: 'New password must be at least 6 characters long.' },
          { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
        );
      }

      const resetResult = await resetAuthUserPassword(email, code, newPassword, pluginMeta.slug);
      if (!resetResult.success || !resetResult.user || !resetResult.token) {
        return NextResponse.json(
          { success: false, message: resetResult.message || 'Failed to reset password.' },
          { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
        );
      }

      const sessionCode = generateSessionCode();

      return NextResponse.json(
        {
          success: true,
          message: 'Password reset successfully. You are now logged in.',
          token: resetResult.token,
          sessionCode,
          user: {
            id: resetResult.user.id,
            email: resetResult.user.email,
            name: resetResult.user.name,
            company_name: resetResult.user.company_name,
            website_url: resetResult.user.website_url,
            plan: resetResult.user.plan,
            plugin_slug: resetResult.user.plugin_slug,
            plugin_name: resetResult.user.plugin_name,
            status: resetResult.user.status,
            created_at: resetResult.user.created_at,
            last_login_at: resetResult.user.last_login_at,
          },
          plugin: {
            slug: pluginMeta.slug,
            name: pluginMeta.name,
            version: pluginMeta.version,
          },
        },
        { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action specified. Must be "request" or "reset".' },
      { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (error) {
    console.error('Error in password reset route:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error processing password reset.' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
