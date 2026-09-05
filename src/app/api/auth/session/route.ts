import { NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth/session';

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session || !session.user) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: session.user,
    });
  } catch (error) {
    console.error('Session retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve session', authenticated: false, user: null },
      { status: 500 }
    );
  }
}
