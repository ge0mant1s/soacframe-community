
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// POST /api/threat-intel/feeds/[id]/sync - Sync feed (simulated)
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const feed = await prisma.threatFeed.findUnique({
      where: { id: params.id },
    });

    if (!feed) {
      return NextResponse.json({ error: 'Feed not found' }, { status: 404 });
    }

    // Simulate feed sync with sample indicators
    const sampleIndicators = [
      {
        feedId: params.id,
        iocType: 'IP_ADDRESS',
        value: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        confidence: Math.floor(Math.random() * 40) + 60,
        severity: ['critical', 'high', 'medium'][Math.floor(Math.random() * 3)],
        firstSeen: new Date(),
        lastSeen: new Date(),
        tags: ['malware', 'c2'],
        mitreAttack: ['T1071'],
        threatActors: ['APT28'],
        description: 'Suspicious IP address detected in threat intelligence feed',
      },
      {
        feedId: params.id,
        iocType: 'DOMAIN',
        value: `malicious-domain-${Date.now()}.com`,
        confidence: Math.floor(Math.random() * 40) + 60,
        severity: ['critical', 'high', 'medium'][Math.floor(Math.random() * 3)],
        firstSeen: new Date(),
        lastSeen: new Date(),
        tags: ['phishing'],
        mitreAttack: ['T1566'],
        threatActors: ['Unknown'],
        description: 'Malicious domain used in phishing campaign',
      },
    ];

    // Add indicators
    for (const indicator of sampleIndicators) {
      await prisma.threatIndicator.create({ data: indicator as any });
    }

    // Update feed sync time
    await prisma.threatFeed.update({
      where: { id: params.id },
      data: { lastSync: new Date() },
    });

    return NextResponse.json({ 
      success: true, 
      message: `Synced ${sampleIndicators.length} new indicators` 
    });
  } catch (error) {
    console.error('Error syncing feed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
