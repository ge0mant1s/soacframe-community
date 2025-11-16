
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkUsageLimit } from '@/lib/access-control';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type) {
      return NextResponse.json({ error: 'Type parameter required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const result = await checkUsageLimit(
      user.id, 
      type as 'alerts' | 'incidents' | 'aiQueries' | 'reports' | 'workflows' | 'dashboards'
    );
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error checking usage limit:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
