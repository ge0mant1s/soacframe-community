
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST /api/config/import - Import configuration
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { backupType, data, mergeStrategy } = await request.json();

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    // Import based on type and strategy
    try {
      switch (backupType) {
        case 'WORKFLOWS':
          if (data.playbooks) {
            for (const playbook of data.playbooks) {
              try {
                const { id, steps, executions, ...playbookData } = playbook;
                const created = await prisma.playbook.create({
                  data: {
                    ...playbookData,
                    steps: {
                      create: steps?.map((step: any) => {
                        const { id, ...stepData } = step;
                        return stepData;
                      }) || [],
                    },
                  },
                });
                imported++;
              } catch (error) {
                if (mergeStrategy === 'skip') skipped++;
                else errors++;
              }
            }
          }
          break;

        case 'INTEGRATIONS':
          if (Array.isArray(data)) {
            for (const integration of data) {
              try {
                const { id, ...integrationData } = integration;
                await prisma.integration.create({ data: integrationData });
                imported++;
              } catch (error) {
                if (mergeStrategy === 'skip') skipped++;
                else errors++;
              }
            }
          }
          break;

        default:
          return NextResponse.json({ error: 'Import type not supported yet' }, { status: 400 });
      }
    } catch (error) {
      console.error('Error during import:', error);
      errors++;
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      errors,
      message: `Imported ${imported} items, skipped ${skipped}, errors ${errors}`,
    });
  } catch (error) {
    console.error('Error importing config:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
