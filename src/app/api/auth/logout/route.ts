import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/auth/session';

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Signed out successfully.',
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: '',
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to sign out.' },
      { status: 500 }
    );
  }
}
