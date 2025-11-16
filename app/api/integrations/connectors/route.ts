
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET /api/integrations/connectors - List available connectors
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const installed = searchParams.get('installed');

    const where: any = {};
    if (category) where.category = category;
    if (status) where.status = status;
    if (installed === 'true') where.installed = true;
    if (installed === 'false') where.installed = false;

    const connectors = await prisma.integrationConnector.findMany({
      where,
      include: {
        installations: {
          select: {
            id: true,
            name: true,
            status: true,
            lastSync: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(connectors);
  } catch (error) {
    console.error('Error fetching connectors:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/integrations/connectors - Create new connector (admin only)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const {
      name,
      description,
      category,
      vendor,
      iconUrl,
      version,
      capabilities,
      pricing,
      documentation,
      setupGuide,
      requiredFields,
    } = data;

    const connector = await prisma.integrationConnector.create({
      data: {
        name,
        description,
        category,
        vendor,
        iconUrl,
        version,
        capabilities: capabilities || [],
        pricing,
        documentation,
        setupGuide,
        requiredFields,
      },
    });

    return NextResponse.json(connector, { status: 201 });
  } catch (error) {
    console.error('Error creating connector:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
