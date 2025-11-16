
// Community Edition Feature Limits
// These limits are enforced throughout the application

export const COMMUNITY_LIMITS = {
  // AI Hub Limits
  AI_QUERIES_PER_DAY: 10,
  AI_RATE_LIMIT_WINDOW: 24 * 60 * 60 * 1000, // 24 hours in ms
  
  // Resource Limits
  MAX_DEVICES: 50,
  MAX_PLAYBOOKS: 5,
  MAX_USERS: 5,
  MAX_INTEGRATIONS: 5,
  MAX_WORKFLOWS: 3,
  
  // Data & Storage
  DATA_RETENTION_DAYS: 30,
  MAX_STORAGE_MB: 500,
  MAX_FILE_UPLOAD_MB: 10,
  
  // Reporting
  REPORT_TYPES: ['security'] as const, // Only security reports available
  EXPORT_FORMATS: ['csv', 'json'] as const, // No PDF exports
  MAX_SCHEDULED_REPORTS: 2,
  
  // Feature Flags
  FEATURES: {
    ADVANCED_ANALYTICS: false,
    CUSTOM_DASHBOARDS: false,
    WORKFLOW_AUTOMATION: false,
    THREAT_INTEL_FEEDS: false,
    API_ACCESS: false,
    SSO_GOOGLE: false,
    MULTI_USER_COLLABORATION: true, // Up to 5 users
    BASIC_REPORTING: true,
    AI_ASSISTANCE: true, // Limited queries
    INCIDENT_MANAGEMENT: true,
    ALERT_MANAGEMENT: true,
    DEVICE_MONITORING: true,
  },
};

export function isFeatureEnabled(feature: keyof typeof COMMUNITY_LIMITS.FEATURES): boolean {
  return COMMUNITY_LIMITS.FEATURES[feature];
}

export function checkLimit(metric: keyof typeof COMMUNITY_LIMITS, current: number): boolean {
  const limit = COMMUNITY_LIMITS[metric];
  if (typeof limit === 'number') {
    return current < limit;
  }
  return true;
}

export function getRemainingQuota(metric: keyof typeof COMMUNITY_LIMITS, current: number): number {
  const limit = COMMUNITY_LIMITS[metric];
  if (typeof limit === 'number') {
    return Math.max(0, limit - current);
  }
  return -1; // Unlimited
}

// Helper to display upgrade message
export function getUpgradeMessage(): string {
  return 'Upgrade to Premium at https://soacframe.io for unlimited access';
}
