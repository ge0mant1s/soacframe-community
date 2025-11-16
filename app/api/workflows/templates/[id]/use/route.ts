
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST /api/workflows/templates/[id]/use - Create playbook from template
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const template = await prisma.playbookTemplate.findUnique({
      where: { id: params.id },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, description } = body;

    // Create playbook from template
    const playbook = await prisma.playbook.create({
      data: {
        name: name || template.name,
        description: description || template.description,
        category: template.category,
        triggerType: 'MANUAL',
        mitreMapping: template.mitreAttack,
        isActive: true,
        isDefault: false,
        createdBy: session.user?.email || 'admin',
      },
    });

    // Create steps from template
    const templateSteps = template.steps as any[];
    for (let i = 0; i < templateSteps.length; i++) {
      const step = templateSteps[i];
      await prisma.workflowStep.create({
        data: {
          playbookId: playbook.id,
          stepNumber: i + 1,
          name: step.name,
          actionType: step.actionType,
          config: step.config || {},
          timeout: step.timeout || 300,
          retryCount: step.retryCount || 0,
          continueOnFail: step.continueOnError || false,
        },
      });
    }

    // Increment download counter
    await prisma.playbookTemplate.update({
      where: { id: template.id },
      data: {
        downloads: { increment: 1 },
      },
    });

    return NextResponse.json({ playbook });
  } catch (error) {
    console.error('Error using template:', error);
    return NextResponse.json(
      { error: 'Failed to create playbook from template' },
      { status: 500 }
    );
  }
}
