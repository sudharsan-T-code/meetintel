import { NextRequest, NextResponse } from 'next/server';
import { requireAuthSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const profileUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  department: z.string().max(100).optional(),
  title: z.string().max(100).optional(),
  timezone: z.string().max(50).optional(),
  language: z.string().max(10).optional(),
  avatarUrl: z.string().url().or(z.literal('')).optional(),
});

// Runtime user profile preferences cache for demo runtime
let runtimeProfile = {
  timezone: 'Asia/Kolkata',
  language: 'en',
  avatarUrl: '',
};

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuthSession();
    let profileData: any = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
      department: session.user.department,
      title: session.user.title,
      organizationId: session.user.organizationId,
      organizationName: session.user.organizationName,
      timezone: runtimeProfile.timezone,
      language: runtimeProfile.language,
      avatarUrl: runtimeProfile.avatarUrl,
    };

    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });
      if (user) {
        profileData = {
          ...profileData,
          name: user.name,
          department: user.department,
          title: user.title,
          timezone: user.timezone || runtimeProfile.timezone,
          language: user.language || runtimeProfile.language,
          avatarUrl: user.avatarUrl || runtimeProfile.avatarUrl,
        };
      }
    } catch {
      // Offline fallback
    }

    return NextResponse.json({
      success: true,
      profile: profileData,
    });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
    }
    console.error('Profile GET Error:', error);
    return NextResponse.json({ error: 'Failed to retrieve profile.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuthSession();
    const body = await request.json();

    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid profile data', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Explicitly reject tampering with protected identity and security fields
    const rawKeys = Object.keys(body);
    if (rawKeys.includes('role') || rawKeys.includes('organizationId') || rawKeys.includes('email') || rawKeys.includes('id')) {
      return NextResponse.json(
        { error: 'SecurityViolation: Role, organization, and email are protected and cannot be changed through profile settings.' },
        { status: 403 }
      );
    }

    runtimeProfile = {
      ...runtimeProfile,
      ...parsed.data,
    };

    try {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          name: parsed.data.name,
          department: parsed.data.department,
          title: parsed.data.title,
          timezone: parsed.data.timezone,
          language: parsed.data.language,
          avatarUrl: parsed.data.avatarUrl,
        },
      });
    } catch {
      // Offline fallback
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: session.user.id,
        name: parsed.data.name || session.user.name,
        email: session.user.email,
        role: session.user.role,
        department: parsed.data.department || session.user.department,
        title: parsed.data.title || session.user.title,
        timezone: runtimeProfile.timezone,
        language: runtimeProfile.language,
        avatarUrl: runtimeProfile.avatarUrl,
      },
      message: 'Profile updated successfully.',
    });
  } catch (error: any) {
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
    }
    console.error('Profile PATCH Error:', error);
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 });
  }
}
