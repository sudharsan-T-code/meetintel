import 'server-only';
import crypto from 'crypto';
import { demoUser, demoOrganization } from '@/lib/demo-data';
import { normalizeRole, UserRole } from './rbac';

export const SESSION_COOKIE_NAME = 'meetintel_session';

const AUTH_SECRET =
  process.env.NEXTAUTH_SECRET ||
  process.env.AUTH_SECRET ||
  'meetintel-enterprise-session-secret-key-32b-min!';

export interface SessionUser {
  id: string;
  organizationId: string;
  organizationName: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  title: string;
  avatar?: string;
}

export interface AuthSession {
  user: SessionUser;
}

export interface SessionTokenPayload extends SessionUser {
  iat: number;
  exp: number;
}

// Canonical Demo Personas
export const DEMO_PERSONAS: Record<string, SessionUser> = {
  admin: {
    id: 'user-admin-001',
    organizationId: demoOrganization.id,
    organizationName: demoOrganization.name,
    email: 'admin@cognizant.com',
    name: 'Rajesh Kumar',
    role: 'ADMIN',
    department: 'Technology',
    title: 'Chief Technology Officer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  },
  manager: {
    id: 'user-demo-001',
    organizationId: demoOrganization.id,
    organizationName: demoOrganization.name,
    email: 'priya.sharma@cognizant.com',
    name: 'Priya Sharma',
    role: 'MANAGER',
    department: 'Engineering',
    title: 'Senior Engineering Manager',
    avatar: demoUser.avatar,
  },
  product: {
    id: 'user-002',
    organizationId: demoOrganization.id,
    organizationName: demoOrganization.name,
    email: 'sarah.chen@cognizant.com',
    name: 'Sarah Chen',
    role: 'MANAGER',
    department: 'Product',
    title: 'Principal Product Manager',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
  },
  employee: {
    id: 'user-004',
    organizationId: demoOrganization.id,
    organizationName: demoOrganization.name,
    email: 'ananya.patel@cognizant.com',
    name: 'Ananya Patel',
    role: 'EMPLOYEE',
    department: 'Engineering',
    title: 'Staff Frontend Engineer',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
  },
  hr: {
    id: 'user-006',
    organizationId: demoOrganization.id,
    organizationName: demoOrganization.name,
    email: 'vikram.malhotra@cognizant.com',
    name: 'Vikram Malhotra',
    role: 'HR',
    department: 'Human Resources',
    title: 'HR Business Partner',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
  },
};

/**
 * Creates a cryptographically signed session token.
 */
export function createSessionToken(user: SessionUser): string {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 7 * 24 * 60 * 60; // 7 days expiration
  const payload: SessionTokenPayload = { ...user, iat, exp };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${signature}`;
}

/**
 * Verifies and decodes a signed session token.
 */
export function verifySessionToken(token: string): SessionUser | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [encoded, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(encoded)
      .digest('base64url');

    // Constant-time comparison
    if (signature.length !== expectedSignature.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload: SessionTokenPayload = JSON.parse(
      Buffer.from(encoded, 'base64url').toString('utf8')
    );

    // Validate expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return {
      id: payload.id,
      organizationId: payload.organizationId,
      organizationName: payload.organizationName,
      email: payload.email,
      name: payload.name,
      role: normalizeRole(payload.role),
      department: payload.department || 'General',
      title: payload.title || 'Member',
      avatar: payload.avatar,
    };
  } catch {
    return null;
  }
}

/**
 * Resolves the current session from cookies, headers, or demo configuration.
 */
export async function getCurrentSession(): Promise<AuthSession | null> {
  let cookieToken: string | undefined;
  let roleOverride: string | null = null;
  let orgIdOverride: string | null = null;
  let userIdOverride: string | null = null;
  let emailOverride: string | null = null;
  let unauthFlag: string | null = null;

  try {
    const { cookies, headers } = await import('next/headers');
    const cookieStore = await cookies();
    cookieToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    const h = await headers();
    roleOverride = h.get('x-user-role');
    orgIdOverride = h.get('x-organization-id');
    userIdOverride = h.get('x-user-id');
    emailOverride = h.get('x-user-email');
    unauthFlag = h.get('x-auth-unauthenticated');
  } catch {
    // Outside request context (e.g. static generation)
  }

  // Explicit unauthenticated signal
  if (
    unauthFlag === 'true' ||
    roleOverride?.toUpperCase() === 'UNAUTHENTICATED' ||
    roleOverride?.toUpperCase() === 'ANONYMOUS'
  ) {
    return null;
  }

  // 1. If a valid session cookie exists, use it
  if (cookieToken) {
    const verifiedUser = verifySessionToken(cookieToken);
    if (verifiedUser) {
      return { user: verifiedUser };
    }
  }

  // 2. If test/override headers are provided, construct session
  if (roleOverride || userIdOverride || emailOverride || orgIdOverride) {
    const normalizedRole = normalizeRole(roleOverride || 'EMPLOYEE');
    const isSpecialAdmin = normalizedRole === 'ADMIN' || normalizedRole === 'SUPER_ADMIN';

    let baseUser = DEMO_PERSONAS.manager;
    if (isSpecialAdmin) {
      baseUser = DEMO_PERSONAS.admin;
    } else if (normalizedRole === 'EMPLOYEE') {
      baseUser = DEMO_PERSONAS.employee;
    } else if (normalizedRole === 'HR') {
      baseUser = DEMO_PERSONAS.hr;
    }

    return {
      user: {
        id: userIdOverride || baseUser.id,
        organizationId: orgIdOverride || demoOrganization.id,
        organizationName: orgIdOverride ? `Organization ${orgIdOverride}` : demoOrganization.name,
        email: emailOverride || baseUser.email,
        name: isSpecialAdmin ? 'Rajesh Kumar' : baseUser.name,
        role: normalizedRole,
        department: baseUser.department,
        title: isSpecialAdmin ? 'Enterprise Administrator' : baseUser.title,
        avatar: baseUser.avatar,
      },
    };
  }

  // 3. Fallback for demo environment (when no cookie and no headers)
  // In demo mode, defaults to Priya Sharma (Senior Engineering Manager)
  const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false';
  if (isDemo) {
    return {
      user: DEMO_PERSONAS.manager,
    };
  }

  return null;
}

/**
 * Requires an authenticated user session, throwing HTTP 401 otherwise.
 */
export async function requireAuthSession(): Promise<AuthSession> {
  const session = await getCurrentSession();
  if (!session || !session.user) {
    throw new Error('Unauthorized: Authentication required.');
  }
  return session;
}

/**
 * Requires an administrative user session (ADMIN or SUPER_ADMIN), throwing 403 otherwise.
 */
export async function requireAdminSession(): Promise<AuthSession> {
  const session = await requireAuthSession();
  const role = normalizeRole(session.user.role);
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    throw new Error('Forbidden: Administrative privileges required.');
  }
  return session;
}
