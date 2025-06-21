export interface SecurityConfig {
  encryption: {
    algorithm: string
    keyRotationInterval: number
    backupEncryption: boolean
  }
  audit: {
    enabled: boolean
    retentionDays: number
    logLevel: "basic" | "detailed" | "comprehensive"
  }
  access: {
    sessionTimeout: number
    maxFailedAttempts: number
    requireMFA: boolean
    passwordPolicy: PasswordPolicy
  }
  backup: {
    enabled: boolean
    frequency: "daily" | "weekly" | "monthly"
    retentionCount: number
    encryptBackups: boolean
  }
}

export interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  preventReuse: number
  expirationDays?: number
}

export interface AuditLog {
  id: string
  userId: string
  action: AuditAction
  resource: string
  resourceId?: string
  details: Record<string, any>
  ipAddress: string
  userAgent: string
  timestamp: Date
  severity: "low" | "medium" | "high" | "critical"
  category: "authentication" | "data_access" | "data_modification" | "system" | "security"
}

export type AuditAction =
  | "login"
  | "logout"
  | "failed_login"
  | "password_change"
  | "data_export"
  | "data_import"
  | "transaction_create"
  | "transaction_update"
  | "transaction_delete"
  | "goal_create"
  | "goal_update"
  | "budget_create"
  | "budget_update"
  | "report_generate"
  | "settings_change"
  | "backup_create"
  | "backup_restore"

export interface UserRole {
  id: string
  name: string
  permissions: Permission[]
  description: string
  isSystem: boolean
}

export interface Permission {
  id: string
  resource: string
  actions: string[]
  conditions?: Record<string, any>
}

export interface DataBackup {
  id: string
  userId: string
  type: "manual" | "automatic"
  status: "pending" | "in_progress" | "completed" | "failed"
  size: number
  encryptionKey: string
  createdAt: Date
  completedAt?: Date
  expiresAt: Date
  metadata: {
    version: string
    checksum: string
    tables: string[]
  }
}

export interface SystemHealth {
  id: string
  timestamp: Date
  status: "healthy" | "warning" | "critical"
  metrics: {
    cpu: number
    memory: number
    disk: number
    database: number
    responseTime: number
  }
  alerts: SystemAlert[]
}

export interface SystemAlert {
  id: string
  type: "performance" | "security" | "data" | "system"
  severity: "low" | "medium" | "high" | "critical"
  message: string
  details: Record<string, any>
  isResolved: boolean
  createdAt: Date
  resolvedAt?: Date
}
