import { authRateLimit } from '@/lib/auth-rate-limit';
import { hashPassword, verifyPassword } from '@/lib/passwords';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  createOrUpdateFramerUser,
  findFramerUser,
  generateSessionCode,
  confirmPairingSession,
  sendAuthOtpCode,
  verifyAuthOtpCode,
} from '@/lib/framer-auth';
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

    if (!email || typeof email !== 'string' || !/^\S+@[^\s@,<>;]+\.[^\s@,<>;]+$/.test(email) || email.length > 254 || /[,<>;]/.test(email)) {
      return NextResponse.json(
        { success: false, message: 'A valid email address is required.' },
        {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    const pluginMeta = getPluginMetadata(plugin);
    if (!await authRateLimit(request,email,pluginMeta.slug,mode)) return NextResponse.json({success:false,message:'Too many attempts. Please try again later.'},{status:429});
    const commerce = true; // Every plugin uses the same verified account requirements.
    if (commerce && (!['signup', 'signin'].includes(mode) || typeof password !== 'string' || password.length < 6 || password.length > 128)) {
      return NextResponse.json({ success: false, message: 'Choose sign in or sign up and enter a password of at least 6 characters.' }, { status: 400 });
    }

    const rawCompany = typeof company_name === 'string' ? company_name : (typeof companyName === 'string' ? companyName : '');
    const resolvedCompany = rawCompany.trim().length > 0 ? rawCompany.trim() : undefined;

    const rawWebsite = typeof website_url === 'string' ? website_url : (typeof websiteUrl === 'string' ? websiteUrl : '');
    const resolvedWebsite = rawWebsite.trim().length > 0 ? rawWebsite.trim() : undefined;

    const resolvedTeamName = team_name || teamName || '';
    const resolvedTeamRole = team_role || teamRole || 'owner';

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await findFramerUser(normalizedEmail, pluginMeta.slug);

    if (commerce && existingUser && (existingUser.status === 'suspended' || existingUser.status === 'inactive')) {
      return NextResponse.json({ success: false, message: 'This account is not active.' }, { status: 403 });
    }
    if (commerce && mode === 'signin' && existingUser && (existingUser.status !== 'active' || !existingUser.metadata?.password_hash || existingUser.metadata?.email_verified !== true)) {
      return NextResponse.json({ success: false, message: 'Verify your email or use an email code to sign in.' }, { status: 401 });
    }
    // Hard Requirement: If user does not have an account beforehand, they must sign up first; sign-in is strictly not allowed
    if (mode === 'signin' && !existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'No account found with this email. Please sign up first.',
          message: 'No account found with this email. Please sign up first before signing in.',
          requiresSignup: true,
        },
        {
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-framer-token',
          },
        }
      );
    }

    // Hard Requirement: If user already has an active account, sign-up is not allowed; they must sign in
    if (mode === 'signup' && existingUser && existingUser.status === 'active' && existingUser.metadata?.password_hash) {
      return NextResponse.json(
        {
          success: false,
          error: 'An account with this email already exists. Please sign in instead.',
          message: 'An account with this email already exists. Please sign in instead.',
          requiresSignin: true,
        },
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-framer-token',
          },
        }
      );
    }

    // On sign-up: verify OTP code or dispatch verification email
    const submittedOtp = body.otp_code || body.code || body.otp;
    if (mode === 'signup') {
      if (!submittedOtp) {
        const delivery = await sendAuthOtpCode(normalizedEmail, pluginMeta.slug);
        if (!delivery.success) return NextResponse.json({ success: false, message: 'Verification email could not be sent. Try again shortly.' }, { status: 503 });
        return NextResponse.json(
          {
            success: false,
            requiresOtp: true,
            message: `A 6-digit verification code has been sent to ${normalizedEmail}. Please enter it to verify your email.`,
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
      }

      const verifyResult = await verifyAuthOtpCode(normalizedEmail, String(submittedOtp), pluginMeta.slug);
      if (!verifyResult.valid) {
        return NextResponse.json(
          {
            success: false,
            error: verifyResult.message || 'Invalid or expired verification code.',
            message: verifyResult.message || 'Invalid or expired verification code.',
          },
          {
            status: 400,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-framer-token',
            },
          }
        );
      }
    }

    // On sign-in: verify password against stored metadata.password_hash if it exists
    if (existingUser?.metadata && typeof existingUser.metadata.password_hash === 'string') {
      const storedHash = existingUser.metadata.password_hash;
      const submittedPassword = typeof password === 'string' ? password : '';
      const directHash = crypto.createHash('sha256').update(submittedPassword).digest('hex');
      const saltedHash = crypto.createHash('sha256').update('qubtic_pwd_salt_' + submittedPassword).digest('hex');

      if (!verifyPassword(submittedPassword, storedHash)) {
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
      passwordHash = hashPassword(password);
    }

    if (mode === 'signin' && existingUser?.metadata?.password_hash && !String(existingUser.metadata.password_hash).startsWith('scrypt:')) passwordHash = hashPassword(password);
    // Save or update in database
    const { user, isNew, token } = await createOrUpdateFramerUser({
      email,
      name,
      company_name: resolvedCompany,
      website_url: resolvedWebsite,
      pluginSlug: pluginMeta.slug,
      framerUserId,
      framerProjectId,
      plan: 'free',
      metadata: {
        ...(commerce ? {} : metadata),
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

    // Auto-confirm pairing session if user_code/pairing_code was provided
    const rawPairingCode = body.pairing_code || body.pairingCode || body.user_code || body.userCode || body.code;
    if (rawPairingCode && typeof rawPairingCode === 'string' && rawPairingCode.trim().length > 0) {
      try {
        await confirmPairingSession(rawPairingCode.trim().toUpperCase(), user);
      } catch (confirmErr) {
        console.warn('Auto-confirm pairing error in session route:', confirmErr);
      }
    }

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
