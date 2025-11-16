
/**
 * Report Download API
 * GET - Download a generated report file
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { getFileUrl } from '@/lib/s3';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const report = await prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    if (!report.filePath) {
      return NextResponse.json(
        { error: 'Report file not available' },
        { status: 404 }
      );
    }

    // Generate signed URL for download
    const downloadUrl = await getFileUrl(report.filePath);

    return NextResponse.json({
      downloadUrl,
      fileName: `${report.title.replace(/[^a-zA-Z0-9]/g, '_')}.${report.format.toLowerCase()}`,
      fileSize: report.fileSize,
      expiresIn: 3600, // 1 hour
    });
  } catch (error: any) {
    console.error('Failed to get download URL:', error);
    return NextResponse.json(
      { error: 'Failed to get download URL', details: error.message },
      { status: 500 }
    );
  }
}
