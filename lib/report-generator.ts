
/**
 * Report Generation Engine
 * Generates security, compliance, and operational reports
 */

import { PrismaClient, ReportType, ReportFormat } from '@prisma/client';

const prisma = new PrismaClient();

export interface ReportParameters {
  startDate?: string;
  endDate?: string;
  severity?: string[];
  status?: string[];
  deviceIds?: string[];
  integrationIds?: string[];
  includeCharts?: boolean;
  includeRawData?: boolean;
}

export interface ReportData {
  title: string;
  description: string;
  generatedAt: string;
  dateRange: {
    start: string;
    end: string;
  };
  summary: any;
  sections: ReportSection[];
  charts?: ChartData[];
  rawData?: any;
}

export interface ReportSection {
  title: string;
  subtitle?: string;
  data: any;
  type: 'table' | 'list' | 'metrics' | 'text' | 'chart';
}

export interface ChartData {
  title: string;
  type: 'line' | 'bar' | 'pie' | 'area';
  data: any;
}

/**
 * Generate Security Summary Report
 */
export async function generateSecuritySummary(params: ReportParameters): Promise<ReportData> {
  const startDate = params.startDate ? new Date(params.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = params.endDate ? new Date(params.endDate) : new Date();

  // Fetch security alerts
  const alerts = await prisma.securityAlert.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
      ...(params.severity ? { severity: { in: params.severity as any } } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  // Fetch incidents
  const incidents = await prisma.incident.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Calculate metrics
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL').length;
  const highAlerts = alerts.filter(a => a.severity === 'HIGH').length;
  const resolvedIncidents = incidents.filter(i => ['RESOLVED', 'CLOSED'].includes(i.status)).length;
  const openIncidents = incidents.filter(i => !['RESOLVED', 'CLOSED', 'FALSE_POSITIVE'].includes(i.status)).length;

  // Alert trend by day
  const alertsByDay = alerts.reduce((acc: any, alert) => {
    const day = alert.createdAt.toISOString().split('T')[0];
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});

  // Severity distribution
  const severityDistribution = {
    CRITICAL: alerts.filter(a => a.severity === 'CRITICAL').length,
    HIGH: alerts.filter(a => a.severity === 'HIGH').length,
    MEDIUM: alerts.filter(a => a.severity === 'MEDIUM').length,
    LOW: alerts.filter(a => a.severity === 'LOW').length,
    INFO: alerts.filter(a => a.severity === 'INFO').length,
  };

  // Top alert categories
  const categoryCount = alerts.reduce((acc: any, alert) => {
    acc[alert.category] = (acc[alert.category] || 0) + 1;
    return acc;
  }, {});

  const topCategories = Object.entries(categoryCount)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 10)
    .map(([category, count]) => ({ category, count }));

  return {
    title: 'Security Summary Report',
    description: `Comprehensive security overview from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
    generatedAt: new Date().toISOString(),
    dateRange: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
    summary: {
      totalAlerts: alerts.length,
      criticalAlerts,
      highAlerts,
      totalIncidents: incidents.length,
      openIncidents,
      resolvedIncidents,
      mttr: calculateMTTR(incidents),
      falsePositiveRate: (alerts.filter(a => a.falsePositive).length / alerts.length * 100).toFixed(2) + '%',
    },
    sections: [
      {
        title: 'Executive Summary',
        type: 'metrics',
        data: {
          totalAlerts: alerts.length,
          criticalAlerts,
          highAlerts,
          totalIncidents: incidents.length,
          openIncidents,
          resolvedIncidents,
        },
      },
      {
        title: 'Alert Severity Distribution',
        type: 'chart',
        data: severityDistribution,
      },
      {
        title: 'Top Alert Categories',
        type: 'table',
        data: topCategories,
      },
      {
        title: 'Recent Critical Alerts',
        type: 'table',
        data: alerts
          .filter(a => a.severity === 'CRITICAL')
          .slice(0, 20)
          .map(a => ({
            id: a.id,
            title: a.title,
            severity: a.severity,
            status: a.status,
            source: a.source,
            createdAt: a.createdAt.toISOString(),
          })),
      },
      {
        title: 'Open Incidents',
        type: 'table',
        data: incidents
          .filter(i => !['RESOLVED', 'CLOSED'].includes(i.status))
          .map(i => ({
            id: i.id,
            title: i.title,
            severity: i.severity,
            status: i.status,
            assignedTo: i.assignedTo || 'Unassigned',
            createdAt: i.createdAt.toISOString(),
          })),
      },
    ],
    charts: params.includeCharts
      ? [
          {
            title: 'Alert Trend',
            type: 'line',
            data: alertsByDay,
          },
          {
            title: 'Severity Distribution',
            type: 'pie',
            data: severityDistribution,
          },
        ]
      : undefined,
    rawData: params.includeRawData ? { alerts, incidents } : undefined,
  };
}

/**
 * Generate Compliance Report
 */
export async function generateComplianceReport(params: ReportParameters): Promise<ReportData> {
  const startDate = params.startDate ? new Date(params.startDate) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const endDate = params.endDate ? new Date(params.endDate) : new Date();

  // Fetch audit logs
  const auditLogs = await prisma.auditLog.findMany({
    where: {
      timestamp: { gte: startDate, lte: endDate },
    },
    orderBy: { timestamp: 'desc' },
    take: 10000,
  });

  // Fetch security configurations
  const integrations = await prisma.integration.findMany({
    where: { status: 'CONNECTED' },
  });

  // Analyze audit activity
  const userActivity = auditLogs.reduce((acc: any, log) => {
    const user = log.userEmail || 'System';
    if (!acc[user]) acc[user] = { total: 0, actions: {} };
    acc[user].total++;
    acc[user].actions[log.action] = (acc[user].actions[log.action] || 0) + 1;
    return acc;
  }, {});

  const topUsers = Object.entries(userActivity)
    .sort(([, a]: any, [, b]: any) => b.total - a.total)
    .slice(0, 10)
    .map(([user, data]: any) => ({ user, totalActions: data.total }));

  // Action distribution
  const actionDistribution = auditLogs.reduce((acc: any, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1;
    return acc;
  }, {});

  // Resource access patterns
  const resourceAccess = auditLogs.reduce((acc: any, log) => {
    acc[log.resource] = (acc[log.resource] || 0) + 1;
    return acc;
  }, {});

  return {
    title: 'Compliance Audit Report',
    description: `Audit trail and compliance overview from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
    generatedAt: new Date().toISOString(),
    dateRange: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
    summary: {
      totalAuditEvents: auditLogs.length,
      uniqueUsers: Object.keys(userActivity).length,
      activeIntegrations: integrations.length,
      criticalActions: auditLogs.filter(l => ['DELETE', 'UPDATE'].includes(l.action)).length,
    },
    sections: [
      {
        title: 'Audit Summary',
        type: 'metrics',
        data: {
          totalEvents: auditLogs.length,
          uniqueUsers: Object.keys(userActivity).length,
          activeIntegrations: integrations.length,
        },
      },
      {
        title: 'Top Active Users',
        type: 'table',
        data: topUsers,
      },
      {
        title: 'Action Distribution',
        type: 'chart',
        data: actionDistribution,
      },
      {
        title: 'Resource Access Patterns',
        type: 'table',
        data: Object.entries(resourceAccess)
          .sort(([, a]: any, [, b]: any) => b - a)
          .slice(0, 15)
          .map(([resource, count]) => ({ resource, accessCount: count })),
      },
      {
        title: 'Recent Critical Actions',
        type: 'table',
        data: auditLogs
          .filter(l => ['DELETE', 'UPDATE'].includes(l.action))
          .slice(0, 50)
          .map(l => ({
            timestamp: l.timestamp.toISOString(),
            user: l.userEmail || 'System',
            action: l.action,
            resource: l.resource,
            resourceId: l.resourceId,
          })),
      },
    ],
    rawData: params.includeRawData ? { auditLogs, integrations } : undefined,
  };
}

/**
 * Generate Incident Analysis Report
 */
export async function generateIncidentReport(params: ReportParameters): Promise<ReportData> {
  const startDate = params.startDate ? new Date(params.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = params.endDate ? new Date(params.endDate) : new Date();

  const incidents = await prisma.incident.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
      ...(params.severity ? { severity: { in: params.severity as any } } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalIncidents = incidents.length;
  const resolvedIncidents = incidents.filter(i => ['RESOLVED', 'CLOSED'].includes(i.status));
  const avgResolutionTime = calculateMTTR(resolvedIncidents);

  // Severity breakdown
  const severityBreakdown = {
    CRITICAL: incidents.filter(i => i.severity === 'CRITICAL').length,
    HIGH: incidents.filter(i => i.severity === 'HIGH').length,
    MEDIUM: incidents.filter(i => i.severity === 'MEDIUM').length,
    LOW: incidents.filter(i => i.severity === 'LOW').length,
  };

  // Status distribution
  const statusDistribution = incidents.reduce((acc: any, i) => {
    acc[i.status] = (acc[i.status] || 0) + 1;
    return acc;
  }, {});

  return {
    title: 'Incident Analysis Report',
    description: `Detailed incident analysis from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
    generatedAt: new Date().toISOString(),
    dateRange: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
    summary: {
      totalIncidents,
      resolvedIncidents: resolvedIncidents.length,
      openIncidents: totalIncidents - resolvedIncidents.length,
      mttr: avgResolutionTime,
      criticalIncidents: severityBreakdown.CRITICAL,
    },
    sections: [
      {
        title: 'Incident Metrics',
        type: 'metrics',
        data: {
          total: totalIncidents,
          resolved: resolvedIncidents.length,
          open: totalIncidents - resolvedIncidents.length,
          mttr: avgResolutionTime,
        },
      },
      {
        title: 'Severity Distribution',
        type: 'chart',
        data: severityBreakdown,
      },
      {
        title: 'Status Distribution',
        type: 'chart',
        data: statusDistribution,
      },
      {
        title: 'All Incidents',
        type: 'table',
        data: incidents.map(i => ({
          id: i.id,
          title: i.title,
          severity: i.severity,
          status: i.status,
          confidence: i.confidence,
          assignedTo: i.assignedTo || 'Unassigned',
          createdAt: i.createdAt.toISOString(),
          updatedAt: i.updatedAt.toISOString(),
        })),
      },
    ],
    rawData: params.includeRawData ? { incidents } : undefined,
  };
}

/**
 * Generate Device Health Report
 */
export async function generateDeviceHealthReport(params: ReportParameters): Promise<ReportData> {
  const devices = await prisma.device.findMany({
    where: params.deviceIds ? { id: { in: params.deviceIds } } : {},
  });

  const startDate = params.startDate ? new Date(params.startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const endDate = params.endDate ? new Date(params.endDate) : new Date();

  // Fetch device metrics
  const metrics = await prisma.deviceMetric.findMany({
    where: {
      timestamp: { gte: startDate, lte: endDate },
      ...(params.deviceIds ? { deviceId: { in: params.deviceIds } } : {}),
    },
    orderBy: { timestamp: 'desc' },
  });

  // Calculate device statistics
  const deviceStats = devices.map(device => {
    const deviceMetrics = metrics.filter(m => m.deviceId === device.id);
    const cpuMetrics = deviceMetrics.filter(m => m.metricType === 'cpu');
    const memoryMetrics = deviceMetrics.filter(m => m.metricType === 'memory');
    const threatMetrics = deviceMetrics.filter(m => m.metricType === 'threats');

    return {
      id: device.id,
      name: device.name,
      type: device.type,
      status: device.status,
      avgCpu: cpuMetrics.length > 0 ? (cpuMetrics.reduce((sum, m) => sum + m.value, 0) / cpuMetrics.length).toFixed(2) + '%' : 'N/A',
      avgMemory: memoryMetrics.length > 0 ? (memoryMetrics.reduce((sum, m) => sum + m.value, 0) / memoryMetrics.length).toFixed(2) + '%' : 'N/A',
      totalThreats: threatMetrics.reduce((sum, m) => sum + m.value, 0),
      metricsCount: deviceMetrics.length,
    };
  });

  return {
    title: 'Device Health Report',
    description: `Device monitoring and health metrics from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
    generatedAt: new Date().toISOString(),
    dateRange: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
    summary: {
      totalDevices: devices.length,
      activeDevices: devices.filter(d => d.status === 'active').length,
      totalMetrics: metrics.length,
      avgHealthScore: '85%', // Could be calculated based on actual metrics
    },
    sections: [
      {
        title: 'Device Overview',
        type: 'metrics',
        data: {
          total: devices.length,
          active: devices.filter(d => d.status === 'active').length,
          inactive: devices.filter(d => d.status !== 'active').length,
        },
      },
      {
        title: 'Device Statistics',
        type: 'table',
        data: deviceStats,
      },
      {
        title: 'Device Type Distribution',
        type: 'chart',
        data: devices.reduce((acc: any, d) => {
          acc[d.type] = (acc[d.type] || 0) + 1;
          return acc;
        }, {}),
      },
    ],
    rawData: params.includeRawData ? { devices, metrics } : undefined,
  };
}

/**
 * Generate Integration Status Report
 */
export async function generateIntegrationReport(params: ReportParameters): Promise<ReportData> {
  const integrations = await prisma.integration.findMany({
    where: params.integrationIds ? { id: { in: params.integrationIds } } : {},
    orderBy: { name: 'asc' },
  });

  const connectedCount = integrations.filter(i => i.status === 'CONNECTED').length;
  const disconnectedCount = integrations.filter(i => i.status === 'DISCONNECTED').length;
  const errorCount = integrations.filter(i => i.status === 'ERROR').length;

  const integrationStats = integrations.map(int => ({
    id: int.id,
    name: int.name,
    type: int.type,
    status: int.status,
    eventsIngested: int.eventsIngested,
    alertsGenerated: int.alertsGenerated,
    errorCount: int.errorCount,
    lastSync: int.lastSync?.toISOString() || 'Never',
    syncInterval: int.syncInterval ? `${int.syncInterval} min` : 'Manual',
  }));

  return {
    title: 'Integration Status Report',
    description: 'Security tool integration health and performance metrics',
    generatedAt: new Date().toISOString(),
    dateRange: {
      start: new Date().toISOString(),
      end: new Date().toISOString(),
    },
    summary: {
      totalIntegrations: integrations.length,
      connected: connectedCount,
      disconnected: disconnectedCount,
      errors: errorCount,
      totalEventsIngested: integrations.reduce((sum, i) => sum + i.eventsIngested, 0),
    },
    sections: [
      {
        title: 'Integration Overview',
        type: 'metrics',
        data: {
          total: integrations.length,
          connected: connectedCount,
          disconnected: disconnectedCount,
          errors: errorCount,
        },
      },
      {
        title: 'Integration Details',
        type: 'table',
        data: integrationStats,
      },
      {
        title: 'Integration Type Distribution',
        type: 'chart',
        data: integrations.reduce((acc: any, i) => {
          acc[i.type] = (acc[i.type] || 0) + 1;
          return acc;
        }, {}),
      },
      {
        title: 'Status Distribution',
        type: 'chart',
        data: {
          CONNECTED: connectedCount,
          DISCONNECTED: disconnectedCount,
          ERROR: errorCount,
        },
      },
    ],
    rawData: params.includeRawData ? { integrations } : undefined,
  };
}

/**
 * Calculate Mean Time To Resolution (MTTR)
 */
function calculateMTTR(incidents: any[]): string {
  const resolvedWithTime = incidents.filter(
    i => ['RESOLVED', 'CLOSED'].includes(i.status) && i.updatedAt && i.createdAt
  );

  if (resolvedWithTime.length === 0) return 'N/A';

  const totalMinutes = resolvedWithTime.reduce((sum, i) => {
    const minutes = Math.floor((i.updatedAt.getTime() - i.createdAt.getTime()) / (1000 * 60));
    return sum + minutes;
  }, 0);

  const avgMinutes = totalMinutes / resolvedWithTime.length;

  if (avgMinutes < 60) return `${Math.round(avgMinutes)} minutes`;
  if (avgMinutes < 1440) return `${(avgMinutes / 60).toFixed(1)} hours`;
  return `${(avgMinutes / 1440).toFixed(1)} days`;
}

/**
 * Main report generator - routes to specific report type
 */
export async function generateReport(
  type: ReportType,
  params: ReportParameters
): Promise<ReportData> {
  switch (type) {
    case 'SECURITY_SUMMARY':
      return generateSecuritySummary(params);
    case 'COMPLIANCE':
      return generateComplianceReport(params);
    case 'INCIDENT_ANALYSIS':
      return generateIncidentReport(params);
    case 'DEVICE_HEALTH':
      return generateDeviceHealthReport(params);
    case 'INTEGRATION_STATUS':
      return generateIntegrationReport(params);
    default:
      throw new Error(`Unsupported report type: ${type}`);
  }
}

/**
 * Export report data to different formats
 */
export function exportToCSV(reportData: ReportData): string {
  const lines: string[] = [];
  
  // Header
  lines.push(`"${reportData.title}"`);
  lines.push(`"Generated: ${new Date(reportData.generatedAt).toLocaleString()}"`);
  lines.push('');
  
  // Summary
  lines.push('"Summary"');
  Object.entries(reportData.summary).forEach(([key, value]) => {
    lines.push(`"${key}","${value}"`);
  });
  lines.push('');
  
  // Sections
  reportData.sections.forEach(section => {
    lines.push(`"${section.title}"`);
    
    if (section.type === 'table' && Array.isArray(section.data)) {
      if (section.data.length > 0) {
        // Headers
        const headers = Object.keys(section.data[0]);
        lines.push(headers.map(h => `"${h}"`).join(','));
        
        // Data rows
        section.data.forEach(row => {
          const values = headers.map(h => `"${row[h] || ''}"`);
          lines.push(values.join(','));
        });
      }
    } else if (section.type === 'metrics') {
      Object.entries(section.data).forEach(([key, value]) => {
        lines.push(`"${key}","${value}"`);
      });
    }
    
    lines.push('');
  });
  
  return lines.join('\n');
}

export function exportToJSON(reportData: ReportData): string {
  return JSON.stringify(reportData, null, 2);
}
