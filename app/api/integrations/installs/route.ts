
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/integrations/installs - List all installations
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const installs = await prisma.connectorInstall.findMany({
      include: {
        connector: {
          select: {
            name: true,
            category: true,
            vendor: true,
            iconUrl: true,
          },
        },
      },
      orderBy: { installedAt: 'desc' },
    });

    return NextResponse.json(installs);
  } catch (error) {
    console.error('Error fetching installations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
