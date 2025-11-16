
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// PUT /api/integrations/installs/[id] - Update installation
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    const installation = await prisma.connectorInstall.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(installation);
  } catch (error) {
    console.error('Error updating installation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/integrations/installs/[id] - Uninstall
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const installation = await prisma.connectorInstall.findUnique({
      where: { id: params.id },
      include: { connector: true },
    });

    if (!installation) {
      return NextResponse.json({ error: 'Installation not found' }, { status: 404 });
    }

    // Delete installation
    await prisma.connectorInstall.delete({
      where: { id: params.id },
    });

    // Check if this was the last installation for the connector
    const remainingInstalls = await prisma.connectorInstall.count({
      where: { connectorId: installation.connectorId },
    });

    if (remainingInstalls === 0) {
      await prisma.integrationConnector.update({
        where: { id: installation.connectorId },
        data: { installed: false },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error uninstalling connector:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
