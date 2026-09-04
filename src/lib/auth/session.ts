import 'server-only';
import { demoUser, demoOrganization } from '@/lib/demo-data';

export interface AuthSession {
  user: {
    id: string;
    organizationId: string;
    organizationName: string;
    email: string;
    name: string;
    role: string;
    department: string;
    title: string;
    avatar?: string;
  };
}

export async function getCurrentSession(): Promise<AuthSession | null> {
  let roleOverride: string | null = null;
  let orgIdOverride: string | null = null;
  let userIdOverride: string | null = null;
  let emailOverride: string | null = null;

  try {
    const { headers } = await import('next/headers');
    const h = await headers();
    roleOverride = h.get('x-user-role');
    orgIdOverride = h.get('x-organization-id');
    userIdOverride = h.get('x-user-id');
    emailOverride = h.get('x-user-email');
  } catch {
    // Outside request context (e.g. static rendering)
  }

  const role = (roleOverride || demoUser.role).toUpperCase();
  const organizationId = orgIdOverride || demoOrganization.id;
  const id = userIdOverride || (role === 'ADMIN' || role === 'SUPER_ADMIN' ? 'user-admin-001' : demoUser.id);
  const email = emailOverride || (role === 'ADMIN' || role === 'SUPER_ADMIN' ? 'admin@cognizant.com' : demoUser.email);
  const name = role === 'ADMIN' || role === 'SUPER_ADMIN' ? 'System Administrator' : demoUser.name;

  return {
    user: {
      id,
      organizationId,
      organizationName: orgIdOverride ? `Organization ${orgIdOverride}` : demoOrganization.name,
      email,
      name,
      role,
      department: demoUser.department,
      title: role === 'ADMIN' || role === 'SUPER_ADMIN' ? 'Enterprise Administrator' : demoUser.title,
      avatar: demoUser.avatar,
    },
  };
}

/**
 * Requires an authenticated user session, throwing if unauthenticated.
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
  const role = session.user.role.toUpperCase();
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    throw new Error('Forbidden: Administrative privileges required.');
  }
  return session;
}

