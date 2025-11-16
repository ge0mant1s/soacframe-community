
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/workflows/executions - List workflow executions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const playbookId = searchParams.get('playbookId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    const executions = await prisma.workflowExecution.findMany({
      where: {
        ...(playbookId && { playbookId }),
        ...(status && { status: status as any }),
      },
      include: {
        playbook: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
      orderBy: { startedAt: 'desc' },
      take: limit,
    })

    return NextResponse.json(executions)
  } catch (error) {
    console.error('Error fetching executions:', error)
    return NextResponse.json({ error: 'Failed to fetch executions' }, { status: 500 })
  }
}

// POST /api/workflows/executions - Execute a playbook
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { playbookId, triggeredBy, triggerContext } = body

    if (!playbookId) {
      return NextResponse.json({ error: 'Playbook ID required' }, { status: 400 })
    }

    // Get playbook with steps
    const playbook = await prisma.playbook.findUnique({
      where: { id: playbookId },
      include: {
        steps: {
          orderBy: { stepNumber: 'asc' },
        },
      },
    })

    if (!playbook) {
      return NextResponse.json({ error: 'Playbook not found' }, { status: 404 })
    }

    if (!playbook.isActive) {
      return NextResponse.json({ error: 'Playbook is not active' }, { status: 400 })
    }

    // Create execution record
    const execution = await prisma.workflowExecution.create({
      data: {
        playbookId,
        triggeredBy: triggeredBy || 'MANUAL',
        triggerContext,
        status: 'PENDING',
        executedBy: session.user.id,
      },
    })

    // Execute workflow steps asynchronously
    executeWorkflow(execution.id, playbook, triggerContext).catch((error) => {
      console.error('Workflow execution failed:', error)
    })

    return NextResponse.json(execution, { status: 201 })
  } catch (error) {
    console.error('Error starting execution:', error)
    return NextResponse.json({ error: 'Failed to start execution' }, { status: 500 })
  }
}

// Workflow execution engine
async function executeWorkflow(executionId: string, playbook: any, context: any) {
  const startTime = Date.now()
  const stepResults: any[] = []

  try {
    // Update status to RUNNING
    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: { status: 'RUNNING' },
    })

    // Execute each step
    for (const step of playbook.steps) {
      const stepStartTime = Date.now()
      
      try {
        const result = await executeStep(step, context, stepResults)
        
        stepResults.push({
          stepNumber: step.stepNumber,
          name: step.name,
          status: 'COMPLETED',
          duration: Date.now() - stepStartTime,
          result,
        })
      } catch (error: any) {
        stepResults.push({
          stepNumber: step.stepNumber,
          name: step.name,
          status: 'FAILED',
          duration: Date.now() - stepStartTime,
          error: error.message,
        })

        if (!step.continueOnFail) {
          throw error
        }
      }
    }

    // Update execution as completed
    const duration = Math.floor((Date.now() - startTime) / 1000)
    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        duration,
        stepResults,
      },
    })

    // Update playbook statistics
    await updatePlaybookStats(playbook.id, true, duration)

  } catch (error: any) {
    const duration = Math.floor((Date.now() - startTime) / 1000)
    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        duration,
        stepResults,
        errorMessage: error.message,
      },
    })

    await updatePlaybookStats(playbook.id, false, duration)
  }
}

// Execute individual workflow step
async function executeStep(step: any, context: any, previousResults: any[]): Promise<any> {
  // Simulate step execution based on action type
  // In production, this would integrate with actual systems
  
  await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate work

  switch (step.actionType) {
    case 'SEND_NOTIFICATION':
      return { sent: true, channels: step.config.channels }
    
    case 'ENRICH_DATA':
      return { enriched: true, sources: step.config.sources, data: { ioc_reputation: 'malicious' } }
    
    case 'RUN_QUERY':
      return { executed: true, results: 42 }
    
    case 'CREATE_TICKET':
      return { ticketId: 'INC-' + Math.random().toString(36).substr(2, 9).toUpperCase() }
    
    case 'ISOLATE_ENDPOINT':
      return { isolated: true, endpoint: context?.deviceId || 'unknown' }
    
    case 'BLOCK_IP':
      return { blocked: true, ips: context?.indicators?.ips || [] }
    
    case 'COLLECT_EVIDENCE':
      return { collected: true, artifacts: step.config.artifacts }
    
    case 'EXECUTE_SCRIPT':
      return { executed: true, script: step.config.script }
    
    case 'UPDATE_ALERT':
      if (context?.alertId) {
        await prisma.securityAlert.update({
          where: { id: context.alertId },
          data: { status: 'RESOLVED' },
        })
      }
      return { updated: true }
    
    case 'ESCALATE_INCIDENT':
      if (context?.incidentId) {
        await prisma.incident.update({
          where: { id: context.incidentId },
          data: { severity: 'CRITICAL' },
        })
      }
      return { escalated: true }
    
    default:
      return { executed: true }
  }
}

// Update playbook execution statistics
async function updatePlaybookStats(playbookId: string, success: boolean, duration: number) {
  const playbook = await prisma.playbook.findUnique({
    where: { id: playbookId },
    select: { executionCount: true, successRate: true, avgDuration: true },
  })

  if (!playbook) return

  const newExecutionCount = playbook.executionCount + 1
  const successCount = Math.round(playbook.successRate * playbook.executionCount / 100) + (success ? 1 : 0)
  const newSuccessRate = (successCount / newExecutionCount) * 100
  const newAvgDuration = playbook.avgDuration
    ? Math.round((playbook.avgDuration * playbook.executionCount + duration) / newExecutionCount)
    : duration

  await prisma.playbook.update({
    where: { id: playbookId },
    data: {
      executionCount: newExecutionCount,
      successRate: newSuccessRate,
      avgDuration: newAvgDuration,
    },
  })
}
