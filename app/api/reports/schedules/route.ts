
/**
 * Report Schedules API
 * GET - List all schedules
 * POST - Create a new schedule
 * PUT - Update a schedule
 * DELETE - Delete a schedule
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schedules = await prisma.reportSchedule.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ schedules });
  } catch (error: any) {
    console.error('Failed to fetch schedules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedules', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      templateId,
      frequency,
      schedule,
      format,
      enabled,
      recipients,
      parameters,
    } = body;

    // Validate required fields
    if (!name || !templateId || !frequency || !schedule || !format) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate next run time
    const nextRun = calculateNextRun(frequency, schedule);

    const reportSchedule = await prisma.reportSchedule.create({
      data: {
        name,
        description,
        templateId,
        frequency,
        schedule,
        format,
        enabled: enabled !== false,
        recipients,
        parameters,
        nextRun,
        createdBy: session.user.email || undefined,
      },
    });

    return NextResponse.json({ schedule: reportSchedule });
  } catch (error: any) {
    console.error('Failed to create schedule:', error);
    return NextResponse.json(
      { error: 'Failed to create schedule', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Schedule ID required' }, { status: 400 });
    }

    // Recalculate next run if schedule changed
    if (data.frequency || data.schedule) {
      const existing = await prisma.reportSchedule.findUnique({
        where: { id },
      });
      if (existing) {
        const frequency = data.frequency || existing.frequency;
        const schedule = data.schedule || existing.schedule;
        data.nextRun = calculateNextRun(frequency, schedule);
      }
    }

    const reportSchedule = await prisma.reportSchedule.update({
      where: { id },
      data,
    });

    return NextResponse.json({ schedule: reportSchedule });
  } catch (error: any) {
    console.error('Failed to update schedule:', error);
    return NextResponse.json(
      { error: 'Failed to update schedule', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Schedule ID required' }, { status: 400 });
    }

    await prisma.reportSchedule.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete schedule:', error);
    return NextResponse.json(
      { error: 'Failed to delete schedule', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Calculate next run time based on frequency and schedule
 */
function calculateNextRun(frequency: string, schedule: string): Date {
  const now = new Date();
  
  switch (frequency) {
    case 'DAILY': {
      // Schedule format: "09:00" (HH:MM)
      const [hours, minutes] = schedule.split(':').map(Number);
      const next = new Date(now);
      next.setHours(hours, minutes, 0, 0);
      
      // If time has passed today, schedule for tomorrow
      if (next <= now) {
        next.setDate(next.getDate() + 1);
      }
      
      return next;
    }
    
    case 'WEEKLY': {
      // Schedule format: "MON 09:00" (Day HH:MM)
      const [dayStr, timeStr] = schedule.split(' ');
      const [hours, minutes] = timeStr.split(':').map(Number);
      
      const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const targetDay = days.indexOf(dayStr);
      
      const next = new Date(now);
      next.setHours(hours, minutes, 0, 0);
      
      const currentDay = next.getDay();
      const daysUntilTarget = (targetDay - currentDay + 7) % 7;
      
      if (daysUntilTarget === 0 && next <= now) {
        next.setDate(next.getDate() + 7);
      } else {
        next.setDate(next.getDate() + daysUntilTarget);
      }
      
      return next;
    }
    
    case 'MONTHLY': {
      // Schedule format: "1 09:00" (Day of month HH:MM)
      const [dayStr, timeStr] = schedule.split(' ');
      const day = parseInt(dayStr);
      const [hours, minutes] = timeStr.split(':').map(Number);
      
      const next = new Date(now);
      next.setDate(day);
      next.setHours(hours, minutes, 0, 0);
      
      // If date has passed this month, schedule for next month
      if (next <= now) {
        next.setMonth(next.getMonth() + 1);
      }
      
      return next;
    }
    
    default:
      // Default to tomorrow at 9 AM
      const next = new Date(now);
      next.setDate(next.getDate() + 1);
      next.setHours(9, 0, 0, 0);
      return next;
  }
}
