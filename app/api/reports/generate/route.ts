
/**
 * Report Generation API
 * POST - Generate a new report
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient, ReportType, ReportFormat } from '@prisma/client';
import { generateReport, exportToCSV, exportToJSON } from '@/lib/report-generator';
import { uploadFile } from '@/lib/s3';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      type,
      format,
      templateId,
      parameters,
    } = body;

    // Validate required fields
    if (!title || !type || !format) {
      return NextResponse.json(
        { error: 'Missing required fields: title, type, format' },
        { status: 400 }
      );
    }

    // Create report record
    const report = await prisma.report.create({
      data: {
        title,
        description,
        type: type as ReportType,
        format: format as ReportFormat,
        templateId,
        parameters,
        status: 'GENERATING',
        generatedBy: session.user.email || undefined,
      },
    });

    // Generate report data asynchronously
    try {
      const reportData = await generateReport(type as ReportType, parameters || {});

      let filePath: string | undefined;
      let fileSize: number | undefined;

      // Export to requested format
      if (format === 'CSV') {
        const csvContent = exportToCSV(reportData);
        const buffer = Buffer.from(csvContent, 'utf-8');
        const fileName = `reports/${report.id}.csv`;
        filePath = await uploadFile(buffer, fileName);
        fileSize = buffer.length;
      } else if (format === 'JSON') {
        const jsonContent = exportToJSON(reportData);
        const buffer = Buffer.from(jsonContent, 'utf-8');
        const fileName = `reports/${report.id}.json`;
        filePath = await uploadFile(buffer, fileName);
        fileSize = buffer.length;
      }

      // Update report with data and status
      const updatedReport = await prisma.report.update({
        where: { id: report.id },
        data: {
          status: 'COMPLETED',
          data: reportData as any,
          filePath,
          fileSize,
          completedAt: new Date(),
          expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        },
      });

      return NextResponse.json({
        success: true,
        report: updatedReport,
        preview: format === 'JSON' || format === 'HTML' ? reportData : undefined,
      });
    } catch (genError: any) {
      // Update report status to failed
      await prisma.report.update({
        where: { id: report.id },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
        },
      });

      throw genError;
    }
  } catch (error: any) {
    console.error('Failed to generate report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report', details: error.message },
      { status: 500 }
    );
  }
}
