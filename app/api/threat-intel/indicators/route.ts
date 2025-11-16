
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/threat-intel/indicators - Search indicators
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const feedId = searchParams.get('feedId');
    const iocType = searchParams.get('iocType');
    const severity = searchParams.get('severity');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};
    if (feedId) where.feedId = feedId;
    if (iocType) where.iocType = iocType;
    if (severity) where.severity = severity;
    if (search) {
      where.value = { contains: search, mode: 'insensitive' };
    }

    const [indicators, total] = await Promise.all([
      prisma.threatIndicator.findMany({
        where,
        include: {
          feed: {
            select: {
              name: true,
              provider: true,
            },
          },
        },
        orderBy: { lastSeen: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.threatIndicator.count({ where }),
    ]);

    return NextResponse.json({
      indicators,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching indicators:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
