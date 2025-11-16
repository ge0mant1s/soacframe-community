
import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  try {
    // Create test admin user (required for testing)
    const adminPassword = await bcryptjs.hash('johndoe123', 12)
    const admin = await prisma.user.upsert({
      where: { email: 'john@doe.com' },
      update: {},
      create: {
        email: 'john@doe.com',
        name: 'John Doe',
        password: adminPassword,
        role: 'ADMIN',
      },
    })

    // Create additional test user
    const userPassword = await bcryptjs.hash('password123', 12)
    const user = await prisma.user.upsert({
      where: { email: 'test@soacframe.io' },
      update: {},
      create: {
        email: 'test@soacframe.io',
        name: 'Test User',
        password: userPassword,
        role: 'ANALYST',
      },
    })

    // Create operational models
    const operationalModels = [
      {
        name: 'Ransomware Detection',
        patternId: 'D1',
        description: 'Multi-phase ransomware attack detection from initial delivery through encryption and impact.',
        phases: ['Delivery', 'Execution', 'Encryption', 'Impact'],
        sources: ['Endpoint EDR', 'Email Security', 'Network Firewall', 'File Monitoring'],
        window: '60 minutes',
        severity: 'CRITICAL',
      },
      {
        name: 'Data Theft/Exfiltration',
        patternId: 'D2',
        description: 'Detect data collection, staging, and exfiltration attempts across network and cloud boundaries.',
        phases: ['Collection', 'Staging', 'Transfer', 'Cloud Upload'],
        sources: ['Network Monitoring', 'Cloud Security', 'DLP Systems', 'File Activity'],
        window: '90 minutes',
        severity: 'HIGH',
      },
      {
        name: 'Intrusion Detection',
        patternId: 'I1',
        description: 'Advanced persistent threat detection through initial foothold to lateral movement.',
        phases: ['Initial Foothold', 'Privilege Abuse', 'Lateral Movement', 'Persistence'],
        sources: ['Network Security', 'Endpoint Protection', 'Identity Systems', 'Log Analytics'],
        window: '120 minutes',
        severity: 'CRITICAL',
      },
    ]

    for (const model of operationalModels) {
      await prisma.operationalModel.upsert({
        where: { patternId: model.patternId },
        update: {},
        create: model,
      })
    }

    // Create sample devices
    const devices = [
      {
        name: 'Palo Alto NGFW-01',
        type: 'PALOALTO_NGFW' as const,
        endpoint: 'https://firewall.company.com',
        credentials: 'encrypted_credentials_here',
        config: {
          version: '10.2',
          zone: 'DMZ',
          policies: 150,
        },
      },
      {
        name: 'Microsoft Entra ID',
        type: 'ENTRAID' as const,
        endpoint: 'https://graph.microsoft.com',
        credentials: 'encrypted_token_here',
        config: {
          tenantId: 'tenant-id-here',
          users: 1250,
          groups: 45,
        },
      },
      {
        name: 'Splunk Enterprise',
        type: 'SIEM' as const,
        endpoint: 'https://splunk.company.com',
        credentials: 'encrypted_api_key_here',
        config: {
          version: '9.1',
          indexers: 3,
          searchHeads: 2,
        },
      },
    ]

    for (const device of devices) {
      await prisma.device.create({
        data: device,
      })
    }

    // Create sample incidents
    const incidents = [
      {
        title: 'Ransomware Detection - LAPTOP01',
        description: 'Multi-phase ransomware attack detected on user workstation. File encryption activity observed.',
        severity: 'CRITICAL' as const,
        confidence: 'HIGH' as const,
        patternId: 'D1',
        assignedTo: admin.id,
        entities: {
          user: 'john.doe@company.com',
          host: 'LAPTOP01',
          ip: '192.168.1.100',
        },
        events: [
          { phase: 'Delivery', source: 'Email Gateway', time: '2025-11-14T10:00:00Z' },
          { phase: 'Execution', source: 'EDR', time: '2025-11-14T10:05:00Z' },
          { phase: 'Encryption', source: 'File Monitor', time: '2025-11-14T10:15:00Z' },
        ],
        timeline: [
          { time: '2025-11-14T10:00:00Z', action: 'Incident created', user: 'system' },
          { time: '2025-11-14T10:01:00Z', action: 'Assigned to analyst', user: 'system' },
        ],
      },
      {
        title: 'Data Exfiltration Attempt',
        description: 'Suspicious data staging and transfer activity detected. Large file transfers to external cloud storage.',
        severity: 'HIGH' as const,
        confidence: 'MEDIUM' as const,
        patternId: 'D2',
        assignedTo: user.id,
        entities: {
          user: 'jane.smith@company.com',
          host: 'WORKSTATION02',
          ip: '192.168.1.150',
        },
        events: [
          { phase: 'Collection', source: 'File Monitor', time: '2025-11-14T09:30:00Z' },
          { phase: 'Staging', source: 'EDR', time: '2025-11-14T09:45:00Z' },
          { phase: 'Transfer', source: 'Network Monitor', time: '2025-11-14T10:00:00Z' },
        ],
        timeline: [
          { time: '2025-11-14T09:30:00Z', action: 'Incident created', user: 'system' },
        ],
      },
    ]

    for (const incident of incidents) {
      await prisma.incident.create({
        data: incident,
      })
    }

    // Create default report templates
    const reportTemplates = [
      {
        name: 'Daily Security Summary',
        description: 'Comprehensive daily security overview with alerts, incidents, and trends',
        type: 'SECURITY_SUMMARY' as const,
        category: 'Security',
        isDefault: true,
        config: {
          dateRange: 'last_24_hours',
          includeCharts: true,
          sections: ['alerts', 'incidents', 'trends', 'top_threats'],
        },
      },
      {
        name: 'Weekly Security Report',
        description: 'Weekly security analysis with detailed metrics and recommendations',
        type: 'SECURITY_SUMMARY' as const,
        category: 'Security',
        isDefault: true,
        config: {
          dateRange: 'last_7_days',
          includeCharts: true,
          sections: ['executive_summary', 'alerts', 'incidents', 'mttr', 'recommendations'],
        },
      },
      {
        name: 'Monthly Compliance Report',
        description: 'Comprehensive compliance audit with user activity and access logs',
        type: 'COMPLIANCE' as const,
        category: 'Compliance',
        isDefault: true,
        config: {
          dateRange: 'last_30_days',
          includeCharts: true,
          frameworks: ['SOC2', 'ISO27001', 'GDPR'],
          sections: ['audit_trail', 'user_activity', 'access_logs', 'violations'],
        },
      },
      {
        name: 'Incident Response Report',
        description: 'Detailed incident analysis with resolution metrics and timelines',
        type: 'INCIDENT_ANALYSIS' as const,
        category: 'Operations',
        isDefault: true,
        config: {
          dateRange: 'last_30_days',
          includeCharts: true,
          sections: ['incident_summary', 'resolution_times', 'severity_breakdown', 'open_incidents'],
        },
      },
      {
        name: 'Device Health Dashboard',
        description: 'Endpoint monitoring report with performance and security metrics',
        type: 'DEVICE_HEALTH' as const,
        category: 'Operations',
        isDefault: true,
        config: {
          dateRange: 'last_7_days',
          includeCharts: true,
          sections: ['device_overview', 'health_metrics', 'security_posture', 'threats'],
        },
      },
      {
        name: 'Integration Status Report',
        description: 'Security tool connectivity and performance overview',
        type: 'INTEGRATION_STATUS' as const,
        category: 'Operations',
        isDefault: true,
        config: {
          includeCharts: true,
          sections: ['connection_status', 'sync_metrics', 'error_logs', 'performance'],
        },
      },
      {
        name: 'Executive Security Brief',
        description: 'High-level security overview for executive stakeholders',
        type: 'SECURITY_SUMMARY' as const,
        category: 'Security',
        isDefault: false,
        config: {
          dateRange: 'last_30_days',
          includeCharts: true,
          format: 'executive',
          sections: ['key_metrics', 'critical_incidents', 'risk_summary', 'action_items'],
        },
      },
      {
        name: 'Audit Trail Export',
        description: 'Complete audit log for compliance and forensic analysis',
        type: 'AUDIT_TRAIL' as const,
        category: 'Compliance',
        isDefault: false,
        config: {
          dateRange: 'custom',
          includeCharts: false,
          includeRawData: true,
          sections: ['all_events', 'user_actions', 'system_changes'],
        },
      },
    ]

    for (const template of reportTemplates) {
      await prisma.reportTemplate.upsert({
        where: { 
          name: template.name,
        },
        update: {},
        create: template as any,
      })
    }

    // Create default workflow playbooks
    const playbooks = [
      {
        name: 'Critical Alert Investigation',
        description: 'Automated investigation workflow for critical security alerts',
        category: 'Investigation',
        triggerType: 'ALERT_SEVERITY',
        triggerConditions: { severity: ['CRITICAL', 'HIGH'] },
        isActive: true,
        isDefault: true,
        mitreMapping: { tactics: ['TA0001', 'TA0002'], techniques: ['T1566', 'T1190'] },
      },
      {
        name: 'Malware Containment',
        description: 'Isolate infected endpoints and block malicious IPs',
        category: 'Containment',
        triggerType: 'ALERT_CREATED',
        triggerConditions: { category: ['Malware', 'Ransomware'] },
        isActive: true,
        isDefault: true,
        mitreMapping: { tactics: ['TA0040'], techniques: ['T1486', 'T1490'] },
      },
      {
        name: 'Phishing Response',
        description: 'Automated phishing email analysis and user notification',
        category: 'Remediation',
        triggerType: 'ALERT_CREATED',
        triggerConditions: { category: ['Phishing', 'Email Security'] },
        isActive: true,
        isDefault: true,
        mitreMapping: { tactics: ['TA0001'], techniques: ['T1566.001', 'T1566.002'] },
      },
      {
        name: 'Threat Intelligence Enrichment',
        description: 'Enrich alerts with threat intel from multiple sources',
        category: 'Enrichment',
        triggerType: 'ALERT_CREATED',
        triggerConditions: {},
        isActive: true,
        isDefault: false,
        mitreMapping: {},
      },
      {
        name: 'Incident Escalation',
        description: 'Escalate high-severity incidents to SOC manager',
        category: 'Investigation',
        triggerType: 'INCIDENT_ESCALATED',
        triggerConditions: { severity: ['CRITICAL'] },
        isActive: true,
        isDefault: true,
        mitreMapping: {},
      },
    ]

    for (const playbook of playbooks) {
      const created = await prisma.playbook.upsert({
        where: { name: playbook.name },
        update: {},
        create: playbook as any,
      })

      // Add workflow steps for each playbook
      if (playbook.name === 'Critical Alert Investigation') {
        await prisma.workflowStep.createMany({
          data: [
            {
              playbookId: created.id,
              stepNumber: 1,
              name: 'Send Notification to SOC Team',
              actionType: 'SEND_NOTIFICATION',
              config: { channels: ['email', 'slack'], template: 'critical_alert' },
            },
            {
              playbookId: created.id,
              stepNumber: 2,
              name: 'Enrich with Threat Intelligence',
              actionType: 'ENRICH_DATA',
              config: { sources: ['virustotal', 'alienvault', 'abuseipdb'] },
            },
            {
              playbookId: created.id,
              stepNumber: 3,
              name: 'Query SIEM for Context',
              actionType: 'RUN_QUERY',
              config: { query: 'Get last 24h events for affected entities' },
            },
            {
              playbookId: created.id,
              stepNumber: 4,
              name: 'Create Incident Ticket',
              actionType: 'CREATE_TICKET',
              config: { system: 'ServiceNow', priority: 'P1' },
            },
          ],
          skipDuplicates: true,
        })
      }

      if (playbook.name === 'Malware Containment') {
        await prisma.workflowStep.createMany({
          data: [
            {
              playbookId: created.id,
              stepNumber: 1,
              name: 'Isolate Infected Endpoint',
              actionType: 'ISOLATE_ENDPOINT',
              config: { method: 'network_isolation', notify_user: true },
            },
            {
              playbookId: created.id,
              stepNumber: 2,
              name: 'Block Malicious IPs at Firewall',
              actionType: 'BLOCK_IP',
              config: { duration: '24h', scope: 'global' },
            },
            {
              playbookId: created.id,
              stepNumber: 3,
              name: 'Collect Forensic Evidence',
              actionType: 'COLLECT_EVIDENCE',
              config: { artifacts: ['memory_dump', 'disk_image', 'network_pcap'] },
            },
            {
              playbookId: created.id,
              stepNumber: 4,
              name: 'Notify Security Team',
              actionType: 'SEND_NOTIFICATION',
              config: { channels: ['email', 'pagerduty'], priority: 'high' },
            },
          ],
          skipDuplicates: true,
        })
      }

      if (playbook.name === 'Phishing Response') {
        await prisma.workflowStep.createMany({
          data: [
            {
              playbookId: created.id,
              stepNumber: 1,
              name: 'Analyze Email Headers and Links',
              actionType: 'ENRICH_DATA',
              config: { analysis: ['url_reputation', 'sender_verification', 'attachment_scan'] },
            },
            {
              playbookId: created.id,
              stepNumber: 2,
              name: 'Delete Email from All Mailboxes',
              actionType: 'EXECUTE_SCRIPT',
              config: { script: 'purge_phishing_email', scope: 'organization' },
            },
            {
              playbookId: created.id,
              stepNumber: 3,
              name: 'Send User Awareness Alert',
              actionType: 'SEND_NOTIFICATION',
              config: { template: 'phishing_awareness', target: 'affected_users' },
            },
            {
              playbookId: created.id,
              stepNumber: 4,
              name: 'Update Email Security Rules',
              actionType: 'UPDATE_ALERT',
              config: { action: 'block_sender', duration: 'permanent' },
            },
          ],
          skipDuplicates: true,
        })
      }
    }

    // Create notification templates
    const notificationTemplates = [
      {
        name: 'Critical Alert - Default',
        type: 'ALERT',
        subject: 'CRITICAL ALERT: {{alertTitle}}',
        body: `A critical security alert has been detected:\n\nTitle: {{alertTitle}}\nSeverity: {{alertSeverity}}\nSource: {{alertSource}}\nDetected: {{alertTime}}\n\nDescription:\n{{alertDescription}}\n\nImmediate action required. Review in SOaC Dashboard: {{dashboardLink}}`,
        channelType: null,
        isDefault: true,
        variables: ['alertTitle', 'alertSeverity', 'alertSource', 'alertTime', 'alertDescription', 'dashboardLink'],
      },
      {
        name: 'Incident Created - Email',
        type: 'INCIDENT',
        subject: 'New Security Incident: {{incidentTitle}}',
        body: `Security Incident Report\n\nIncident ID: {{incidentId}}\nTitle: {{incidentTitle}}\nSeverity: {{incidentSeverity}}\nStatus: {{incidentStatus}}\nAssigned To: {{assignedTo}}\nCreated: {{createdTime}}\n\nDescription:\n{{incidentDescription}}\n\nView full details: {{incidentLink}}`,
        channelType: 'EMAIL',
        isDefault: true,
        variables: ['incidentId', 'incidentTitle', 'incidentSeverity', 'incidentStatus', 'assignedTo', 'createdTime', 'incidentDescription', 'incidentLink'],
      },
      {
        name: 'Incident Created - Slack',
        type: 'INCIDENT',
        subject: null,
        body: `🚨 *New Security Incident*\n\n*{{incidentTitle}}*\nSeverity: {{incidentSeverity}} | Status: {{incidentStatus}}\nAssigned: {{assignedTo}}\n\n{{incidentDescription}}\n\n<{{incidentLink}}|View Incident>`,
        channelType: 'SLACK',
        isDefault: true,
        variables: ['incidentTitle', 'incidentSeverity', 'incidentStatus', 'assignedTo', 'incidentDescription', 'incidentLink'],
      },
      {
        name: 'System Maintenance',
        type: 'SYSTEM',
        subject: 'SOaC System Maintenance: {{maintenanceType}}',
        body: `System Maintenance Notification\n\nType: {{maintenanceType}}\nScheduled: {{scheduledTime}}\nDuration: {{duration}}\nImpact: {{impact}}\n\nDetails:\n{{maintenanceDetails}}\n\nQuestions? Contact: support@soacframe.io`,
        channelType: null,
        isDefault: true,
        variables: ['maintenanceType', 'scheduledTime', 'duration', 'impact', 'maintenanceDetails'],
      },
      {
        name: 'Compliance Report Ready',
        type: 'COMPLIANCE',
        subject: 'Compliance Report Available: {{reportName}}',
        body: `Your compliance report is ready for review:\n\nReport: {{reportName}}\nPeriod: {{reportPeriod}}\nGenerated: {{generatedTime}}\nFormat: {{reportFormat}}\n\nCompliance Score: {{complianceScore}}\nCritical Findings: {{criticalFindings}}\n\nDownload: {{downloadLink}}`,
        channelType: 'EMAIL',
        isDefault: true,
        variables: ['reportName', 'reportPeriod', 'generatedTime', 'reportFormat', 'complianceScore', 'criticalFindings', 'downloadLink'],
      },
    ]

    for (const template of notificationTemplates) {
      await prisma.notificationTemplate.upsert({
        where: { name: template.name },
        update: {},
        create: template as any,
      })
    }

    // ========================================
    // PHASE 3 TIER 2: Intelligence & Integration Seed Data
    // ========================================

    console.log('🔌 Seeding Integration Connectors...')
    const connectors = [
      {
        name: 'Splunk Enterprise',
        description: 'Leading SIEM platform for security monitoring and analytics',
        category: 'SIEM',
        vendor: 'Splunk',
        version: '9.1.0',
        capabilities: ['Log Analysis', 'Threat Detection', 'Incident Response', 'Compliance'],
        pricing: 'Enterprise',
        documentation: 'https://docs.splunk.com',
        requiredFields: { api_url: '', api_token: '', search_head: '' },
      },
      {
        name: 'CrowdStrike Falcon',
        description: 'Cloud-native endpoint protection platform',
        category: 'EDR_XDR',
        vendor: 'CrowdStrike',
        version: '6.50',
        capabilities: ['Endpoint Detection', 'Threat Intelligence', 'Incident Response'],
        pricing: 'Paid',
        documentation: 'https://falcon.crowdstrike.com',
        requiredFields: { client_id: '', client_secret: '', base_url: '' },
      },
      {
        name: 'Palo Alto Networks',
        description: 'Next-generation firewall and security platform',
        category: 'FIREWALL',
        vendor: 'Palo Alto',
        version: '11.0',
        capabilities: ['Traffic Analysis', 'Threat Prevention', 'URL Filtering'],
        pricing: 'Enterprise',
        documentation: 'https://docs.paloaltonetworks.com',
        requiredFields: { firewall_ip: '', api_key: '' },
      },
      {
        name: 'Microsoft Sentinel',
        description: 'Cloud-native SIEM and SOAR solution',
        category: 'SIEM',
        vendor: 'Microsoft',
        version: '2024.1',
        capabilities: ['Cloud Security', 'AI Analytics', 'Automated Response'],
        pricing: 'Pay-as-you-go',
        documentation: 'https://docs.microsoft.com/azure/sentinel',
        requiredFields: { workspace_id: '', tenant_id: '', client_id: '', client_secret: '' },
      },
      {
        name: 'Okta',
        description: 'Enterprise identity and access management',
        category: 'IDENTITY_PROVIDER',
        vendor: 'Okta',
        version: '2024.11',
        capabilities: ['SSO', 'MFA', 'User Provisioning', 'Access Management'],
        pricing: 'Paid',
        documentation: 'https://developer.okta.com',
        requiredFields: { okta_domain: '', api_token: '' },
      },
      {
        name: 'Jira Cloud',
        description: 'Issue tracking and project management',
        category: 'TICKETING',
        vendor: 'Atlassian',
        version: 'Cloud',
        capabilities: ['Incident Tracking', 'Workflow Automation', 'Reporting'],
        pricing: 'Free/Paid',
        documentation: 'https://developer.atlassian.com/cloud/jira',
        requiredFields: { site_url: '', email: '', api_token: '' },
      },
    ]

    for (const connector of connectors) {
      try {
        await prisma.integrationConnector.create({
          data: connector as any,
        })
      } catch (e) {
        // Skip if already exists
      }
    }

    console.log('🛡️ Seeding Threat Intelligence Feeds...')
    const threatFeeds = [
      {
        name: 'Abuse.ch Feodo Tracker',
        description: 'Botnet C2 IP addresses',
        feedType: 'IP_REPUTATION',
        provider: 'Abuse.ch',
        sourceUrl: 'https://feodotracker.abuse.ch/downloads/ipblocklist.json',
        updateFrequency: 60,
        status: 'active',
        createdBy: 'admin@soacframe.io',
      },
      {
        name: 'AlienVault OTX',
        description: 'Open threat intelligence community',
        feedType: 'THREAT_ACTOR',
        provider: 'AlienVault',
        sourceUrl: 'https://otx.alienvault.com/api/v1/pulses',
        updateFrequency: 120,
        status: 'active',
        createdBy: 'admin@soacframe.io',
      },
      {
        name: 'Malware Bazaar',
        description: 'Malware sample hashes',
        feedType: 'FILE_HASH',
        provider: 'Abuse.ch',
        sourceUrl: 'https://bazaar.abuse.ch/export/json/recent/',
        updateFrequency: 30,
        status: 'active',
        createdBy: 'admin@soacframe.io',
      },
    ]

    for (const feed of threatFeeds) {
      await prisma.threatFeed.create({
        data: feed as any,
      })
    }

    console.log('📚 Seeding Playbook Templates...')
    const playbookTemplates = [
      {
        name: 'Phishing Email Response',
        description: 'Automated response to phishing email reports',
        category: 'PHISHING',
        useCase: 'Investigate and remediate reported phishing emails',
        mitreAttack: ['T1566.001', 'T1204.002'],
        steps: [
          { name: 'Extract Email Headers', actionType: 'ENRICH_DATA', config: {} },
          { name: 'Check URL Reputation', actionType: 'RUN_QUERY', config: {} },
          { name: 'Quarantine Email', actionType: 'UPDATE_ALERT', config: {} },
          { name: 'Notify Security Team', actionType: 'SEND_NOTIFICATION', config: {} },
        ],
        tags: ['phishing', 'email', 'automated'],
        complexity: 'low',
        estimatedTime: 5,
        author: 'SOaC Framework',
        version: '1.0',
        isPublic: true,
      },
      {
        name: 'Ransomware Containment',
        description: 'Isolate and contain ransomware infections',
        category: 'INCIDENT_RESPONSE',
        useCase: 'Rapid containment of ransomware threats',
        mitreAttack: ['T1486', 'T1490', 'T1489'],
        steps: [
          { name: 'Isolate Infected Endpoint', actionType: 'ISOLATE_ENDPOINT', config: {} },
          { name: 'Disable User Account', actionType: 'DISABLE_USER', config: {} },
          { name: 'Block File Hashes', actionType: 'BLOCK_IP', config: {} },
          { name: 'Create Incident Ticket', actionType: 'CREATE_TICKET', config: {} },
          { name: 'Notify CISO', actionType: 'SEND_NOTIFICATION', config: {} },
        ],
        tags: ['ransomware', 'containment', 'critical'],
        complexity: 'high',
        estimatedTime: 10,
        author: 'SOaC Framework',
        version: '1.0',
        isPublic: true,
      },
      {
        name: 'Data Exfiltration Detection',
        description: 'Detect and investigate data exfiltration attempts',
        category: 'DATA_BREACH',
        useCase: 'Monitor for unusual data transfer patterns',
        mitreAttack: ['T1048', 'T1041', 'T1567'],
        steps: [
          { name: 'Analyze Network Traffic', actionType: 'RUN_QUERY', config: {} },
          { name: 'Identify Data Destination', actionType: 'ENRICH_DATA', config: {} },
          { name: 'Block Destination IP', actionType: 'BLOCK_IP', config: {} },
          { name: 'Collect Evidence', actionType: 'COLLECT_EVIDENCE', config: {} },
          { name: 'Escalate to IR Team', actionType: 'ESCALATE_INCIDENT', config: {} },
        ],
        tags: ['data-loss', 'exfiltration', 'detection'],
        complexity: 'medium',
        estimatedTime: 15,
        author: 'SOaC Framework',
        version: '1.0',
        isPublic: true,
      },
      {
        name: 'Insider Threat Investigation',
        description: 'Investigate suspicious insider activity',
        category: 'INSIDER_THREAT',
        useCase: 'Detect and investigate malicious insider behavior',
        mitreAttack: ['T1078', 'T1530', 'T1213'],
        steps: [
          { name: 'Review User Activity Logs', actionType: 'RUN_QUERY', config: {} },
          { name: 'Check Data Access Patterns', actionType: 'ENRICH_DATA', config: {} },
          { name: 'Suspend User Account', actionType: 'DISABLE_USER', config: {} },
          { name: 'Notify HR and Legal', actionType: 'SEND_NOTIFICATION', config: {} },
          { name: 'Preserve Evidence', actionType: 'COLLECT_EVIDENCE', config: {} },
        ],
        tags: ['insider', 'investigation', 'sensitive'],
        complexity: 'high',
        estimatedTime: 30,
        author: 'SOaC Framework',
        version: '1.0',
        isPublic: true,
      },
      {
        name: 'Cloud Misconfiguration Remediation',
        description: 'Auto-remediate common cloud security misconfigurations',
        category: 'CLOUD_SECURITY',
        useCase: 'Fix insecure cloud resource configurations',
        mitreAttack: ['T1530', 'T1580'],
        steps: [
          { name: 'Scan Cloud Resources', actionType: 'RUN_QUERY', config: {} },
          { name: 'Identify Misconfigurations', actionType: 'ENRICH_DATA', config: {} },
          { name: 'Apply Security Baseline', actionType: 'EXECUTE_SCRIPT', config: {} },
          { name: 'Verify Remediation', actionType: 'RUN_QUERY', config: {} },
          { name: 'Generate Compliance Report', actionType: 'SEND_NOTIFICATION', config: {} },
        ],
        tags: ['cloud', 'compliance', 'automated'],
        complexity: 'medium',
        estimatedTime: 8,
        author: 'SOaC Framework',
        version: '1.0',
        isPublic: true,
      },
    ]

    for (const template of playbookTemplates) {
      await prisma.playbookTemplate.create({
        data: template as any,
      })
    }


    console.log('✅ Database seed completed successfully!')
    console.log('')
    console.log('👤 Test users created:')
    console.log('   Admin: john@doe.com / johndoe123')
    console.log('   User: test@soacframe.io / password123')
    console.log('')
    console.log('📊 Phase 1-2 Data:')
    console.log('   Report templates: ' + reportTemplates.length)
    console.log('   Workflow playbooks: ' + playbooks.length)
    console.log('   Notification templates: ' + notificationTemplates.length)
    console.log('')
    console.log('🚀 Phase 3 Tier 2 Data:')
    console.log('   Integration connectors: ' + connectors.length)
    console.log('   Threat intel feeds: ' + threatFeeds.length)
    console.log('   Playbook templates: ' + playbookTemplates.length)
    console.log('')
    console.log('🎉 SOaC Framework is ready!')
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })