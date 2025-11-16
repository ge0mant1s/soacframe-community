
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/threat-intel/feeds - List threat feeds
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const feedType = searchParams.get('feedType');
    const status = searchParams.get('status');

    const where: any = {};
    if (feedType) where.feedType = feedType;
    if (status) where.status = status;

    const feeds = await prisma.threatFeed.findMany({
      where,
      include: {
        _count: {
          select: { indicators: true },
        },
      },
      orderBy: { lastSync: 'desc' },
    });

    return NextResponse.json(feeds);
  } catch (error) {
    console.error('Error fetching threat feeds:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/threat-intel/feeds - Create threat feed
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { name, description, feedType, sourceUrl, provider, updateFrequency, config } = data;

    const feed = await prisma.threatFeed.create({
      data: {
        name,
        description,
        feedType,
        sourceUrl,
        provider,
        updateFrequency: parseInt(updateFrequency),
        config,
        createdBy: session.user.id!,
      },
    });

    return NextResponse.json(feed, { status: 201 });
  } catch (error) {
    console.error('Error creating threat feed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
