
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST /api/integrations/connectors/[id]/install - Install connector
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { name, config, syncFrequency } = data;

    // Create installation
    const installation = await prisma.connectorInstall.create({
      data: {
        connectorId: params.id,
        name,
        config,
        syncFrequency,
        installedBy: session.user.id!,
      },
    });

    // Update connector installed status
    await prisma.integrationConnector.update({
      where: { id: params.id },
      data: {
        installed: true,
        installedAt: new Date(),
      },
    });

    return NextResponse.json(installation, { status: 201 });
  } catch (error) {
    console.error('Error installing connector:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
