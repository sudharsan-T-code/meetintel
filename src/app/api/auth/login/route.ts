import { NextRequest, NextResponse } from 'next/server';
import {
  createSessionToken,
  DEMO_PERSONAS,
  SESSION_COOKIE_NAME,
  SessionUser,
} from '@/lib/auth/session';
import { demoOrganization } from '@/lib/demo-data';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, persona } = body;

    let targetUser: SessionUser | null = null;

    if (persona && DEMO_PERSONAS[persona]) {
      targetUser = DEMO_PERSONAS[persona];
    } else if (email) {
      const lowerEmail = email.toLowerCase().trim();
      const foundPersona = Object.values(DEMO_PERSONAS).find(
        (p) =>
          p.email.toLowerCase() === lowerEmail ||
          (lowerEmail.includes('rajesh') && p.role === 'ADMIN') ||
          (lowerEmail.includes('priya') && p.id === 'user-demo-001') ||
          (lowerEmail.includes('ananya') && p.role === 'EMPLOYEE') ||
          (lowerEmail.includes('admin') && p.role === 'ADMIN')
      );

      if (foundPersona) {
        targetUser = foundPersona;
      } else {
        // Create standard enterprise user session
        targetUser = {
          id: `user-${Date.now()}`,
          organizationId: demoOrganization.id,
          organizationName: demoOrganization.name,
          email: lowerEmail,
          name: lowerEmail.split('@')[0].replace('.', ' '),
          role: lowerEmail.includes('admin') ? 'ADMIN' : 'EMPLOYEE',
          department: 'Engineering',
          title: lowerEmail.includes('admin') ? 'Enterprise Administrator' : 'Software Engineer',
        };
      }
    } else {
      return NextResponse.json(
        { error: 'Please provide either an email or a valid demo persona.' },
        { status: 400 }
      );
    }

    const token = createSessionToken(targetUser);

    const response = NextResponse.json({
      success: true,
      user: targetUser,
      message: `Authenticated as ${targetUser.name} (${targetUser.role})`,
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during login.' },
      { status: 500 }
    );
  }
}
