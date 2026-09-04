import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { getRolePermissionMatrix, ALL_ROLES, PERMISSION_CATEGORIES } from '@/lib/auth/rbac';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthSession();
    const matrix = getRolePermissionMatrix();

    return NextResponse.json({
      success: true,
      roles: ALL_ROLES,
      categoriesCount: PERMISSION_CATEGORIES.length,
      categories: matrix,
      currentUserRole: session.user.role,
    });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
    }
    console.error('Roles Matrix GET Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve roles matrix.' }, { status: 500 });
  }
}
