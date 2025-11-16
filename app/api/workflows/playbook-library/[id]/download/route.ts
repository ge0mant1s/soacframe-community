
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST /api/workflows/playbook-library/[id]/download - Download (install) template
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const template = await prisma.playbookTemplate.findUnique({
      where: { id: params.id },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Create a playbook from the template
    const playbook = await prisma.playbook.create({
      data: {
        name: template.name,
        description: template.description,
        category: template.useCase,
        triggerType: 'MANUAL',
        mitreMapping: template.mitreAttack,
        createdBy: session.user.id!,
      },
    });

    // Create workflow steps from template
    const steps = template.steps as any[];
    if (Array.isArray(steps)) {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        await prisma.workflowStep.create({
          data: {
            playbookId: playbook.id,
            stepNumber: i + 1,
            name: step.name || `Step ${i + 1}`,
            actionType: step.actionType || 'SEND_NOTIFICATION',
            config: step.config || {},
            parameters: step.parameters || {},
            timeout: step.timeout || 300,
            continueOnFail: step.continueOnFail || false,
          },
        });
      }
    }

    // Increment download count
    await prisma.playbookTemplate.update({
      where: { id: params.id },
      data: { downloads: { increment: 1 } },
    });

    return NextResponse.json({ 
      success: true, 
      playbookId: playbook.id,
      message: 'Playbook installed successfully'
    });
  } catch (error) {
    console.error('Error downloading template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
