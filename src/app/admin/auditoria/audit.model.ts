export type AuditPlatform = 'web' | 'mobile' | 'system';
export type AuditOutcome = 'success' | 'rejected' | 'error';

export interface AuditLogEntry {
  _id?: string;
  timestamp: string;
  actorId?: string;
  actorUsername?: string;
  actorRole?: string;
  action: string;
  platform: AuditPlatform;
  method?: string;
  path?: string;
  targetCollection?: string;
  targetId?: string;
  changes?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  deviceInfo?: string;
  appVersion?: string;
  outcome: AuditOutcome;
  statusCode?: number;
  errorMessage?: string;
  requestId?: string;
}

export interface AuditLogFilters {
  page: number;
  limit: number;
  actorId?: string;
  action?: string;
  platform?: AuditPlatform;
  targetCollection?: string;
  outcome?: AuditOutcome;
  dateFrom?: string;
  dateTo?: string;
}

export interface PagedAuditLogs {
  data: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
