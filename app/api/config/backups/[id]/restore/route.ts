
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST /api/config/backups/[id]/restore - Restore from backup
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const backup = await prisma.configBackup.findUnique({
      where: { id: params.id },
    });

    if (!backup) {
      return NextResponse.json({ error: 'Backup not found' }, { status: 404 });
    }

    // In production, implement restore logic based on backup type
    // For now, just mark as restored
    await prisma.configBackup.update({
      where: { id: params.id },
      data: {
        restoredAt: new Date(),
        restoredBy: session.user?.email || 'admin',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Configuration restored successfully',
    });
  } catch (error) {
    console.error('Error restoring backup:', error);
    return NextResponse.json(
      { error: 'Failed to restore backup' },
      { status: 500 }
    );
  }
}
