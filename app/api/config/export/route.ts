
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST /api/config/export - Export configuration
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { backupType, includeData } = await request.json();

    let exportData: any = {};
    let dataSize = 0;

    // Export based on type
    switch (backupType) {
      case 'FULL_CONFIG':
        const [integrations, playbooks, workflows, channels, templates] = await Promise.all([
          prisma.integration.findMany(),
          prisma.playbook.findMany({ include: { steps: true } }),
          prisma.workflowTrigger.findMany(),
          prisma.notificationChannel.findMany(),
          prisma.notificationTemplate.findMany(),
        ]);
        exportData = { integrations, playbooks, workflows, channels, templates };
        break;

      case 'WORKFLOWS':
        const allPlaybooks = await prisma.playbook.findMany({ include: { steps: true } });
        const allTriggers = await prisma.workflowTrigger.findMany();
        exportData = { playbooks: allPlaybooks, triggers: allTriggers };
        break;

      case 'INTEGRATIONS':
        exportData = await prisma.integration.findMany();
        break;

      case 'DASHBOARDS':
        exportData = await prisma.customDashboard.findMany({ include: { widgets: true } });
        break;

      default:
        return NextResponse.json({ error: 'Invalid backup type' }, { status: 400 });
    }

    const jsonData = JSON.stringify(exportData, null, 2);
    dataSize = Buffer.byteLength(jsonData);

    // Create backup record
    const backup = await prisma.configBackup.create({
      data: {
        name: `${backupType}_${Date.now()}`,
        description: `Export of ${backupType} configuration`,
        backupType,
        data: exportData,
        fileSize: dataSize,
        checksum: Buffer.from(jsonData).toString('base64').slice(0, 32),
        version: '1.0',
        createdBy: session.user.id!,
      },
    });

    return NextResponse.json({
      backup,
      downloadData: jsonData,
    });
  } catch (error) {
    console.error('Error exporting config:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
