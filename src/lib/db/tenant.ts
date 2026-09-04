import 'server-only';
import { prisma } from '@/lib/prisma';

export interface TenantContext {
  organizationId: string;
  userId: string;
  userRole: string;
}

/**
 * Validates that an operation stays within the boundaries of the user's organization.
 */
export function assertTenantAccess(userOrgId: string, resourceOrgId: string): void {
  if (userOrgId !== resourceOrgId) {
    throw new Error('TenantAccessDenied: Access to cross-organization resources is prohibited.');
  }
}

/**
 * Wraps database queries with mandatory organizationId filtering.
 */
export async function withTenantScope<T>(
  tenant: TenantContext,
  queryFn: (orgId: string) => Promise<T>
): Promise<T> {
  if (!tenant.organizationId) {
    throw new Error('InvalidTenantContext: organizationId is required for tenant-scoped operations.');
  }
  return await queryFn(tenant.organizationId);
}

/**
 * Helper to fetch tenant settings and compliance policies.
 */
export async function getTenantSettings(organizationId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: {
      compensationBands: true,
    },
  });

  if (!org) {
    throw new Error(`OrganizationNotFound: Organization ${organizationId} does not exist.`);
  }

  return org;
}
