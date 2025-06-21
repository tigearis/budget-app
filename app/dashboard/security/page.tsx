"use client"

import { useState } from "react"
import { SecurityDashboard } from "@/components/security/security-dashboard"
import type { AuditLog, SystemHealth, DataBackup, SecurityConfig } from "@/lib/types/security"

// Mock data - replace with real data from your API
const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: "1",
    userId: "user1",
    action: "login",
    resource: "authentication",
    details: { method: "email", success: true },
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0...",
    timestamp: new Date("2024-01-15T10:30:00Z"),
    severity: "low",
    category: "authentication",
  },
  {
    id: "2",
    userId: "user1",
    action: "data_export",
    resource: "transactions",
    resourceId: "export-123",
    details: { format: "csv", recordCount: 1250 },
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0...",
    timestamp: new Date("2024-01-15T11:15:00Z"),
    severity: "medium",
    category: "data_access",
  },
  {
    id: "3",
    userId: "user2",
    action: "failed_login",
    resource: "authentication",
    details: { method: "email", reason: "invalid_password", attempts: 3 },
    ipAddress: "203.0.113.45",
    userAgent: "Mozilla/5.0...",
    timestamp: new Date("2024-01-15T12:00:00Z"),
    severity: "high",
    category: "security",
  },
]

const MOCK_SYSTEM_HEALTH: SystemHealth = {
  id: "health-1",
  timestamp: new Date(),
  status: "healthy",
  metrics: {
    cpu: 45,
    memory: 62,
    disk: 78,
    database: 120,
    responseTime: 85,
  },
  alerts: [
    {
      id: "alert-1",
      type: "performance",
      severity: "medium",
      message: "Database response time above threshold",
      details: { threshold: 100, current: 120 },
      isResolved: false,
      createdAt: new Date("2024-01-15T09:00:00Z"),
    },
  ],
}

const MOCK_BACKUPS: DataBackup[] = [
  {
    id: "backup-1",
    userId: "user1",
    type: "automatic",
    status: "completed",
    size: 52428800, // 50MB
    encryptionKey: "encrypted-key-hash",
    createdAt: new Date("2024-01-15T02:00:00Z"),
    completedAt: new Date("2024-01-15T02:15:00Z"),
    expiresAt: new Date("2024-02-15T02:00:00Z"),
    metadata: {
      version: "1.0.0",
      checksum: "sha256-hash",
      tables: ["transactions", "budgets", "goals", "users"],
    },
  },
  {
    id: "backup-2",
    userId: "user1",
    type: "manual",
    status: "completed",
    size: 48234496, // 46MB
    encryptionKey: "encrypted-key-hash",
    createdAt: new Date("2024-01-14T15:30:00Z"),
    completedAt: new Date("2024-01-14T15:42:00Z"),
    expiresAt: new Date("2024-02-14T15:30:00Z"),
    metadata: {
      version: "1.0.0",
      checksum: "sha256-hash",
      tables: ["transactions", "budgets", "goals"],
    },
  },
]

const MOCK_SECURITY_CONFIG: SecurityConfig = {
  encryption: {
    algorithm: "aes-256-gcm",
    keyRotationInterval: 90,
    backupEncryption: true,
  },
  audit: {
    enabled: true,
    retentionDays: 365,
    logLevel: "comprehensive",
  },
  access: {
    sessionTimeout: 3600,
    maxFailedAttempts: 5,
    requireMFA: true,
    passwordPolicy: {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      preventReuse: 5,
      expirationDays: 90,
    },
  },
  backup: {
    enabled: true,
    frequency: "daily",
    retentionCount: 30,
    encryptBackups: true,
  },
}

export default function SecurityPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS)
  const [systemHealth, setSystemHealth] = useState<SystemHealth>(MOCK_SYSTEM_HEALTH)
  const [backups, setBackups] = useState<DataBackup[]>(MOCK_BACKUPS)
  const [securityConfig, setSecurityConfig] = useState<SecurityConfig>(MOCK_SECURITY_CONFIG)

  const handleUpdateConfig = (config: SecurityConfig) => {
    setSecurityConfig(config)
    // TODO: Save to backend
  }

  const handleCreateBackup = () => {
    const newBackup: DataBackup = {
      id: `backup-${Date.now()}`,
      userId: "user1",
      type: "manual",
      status: "pending",
      size: 0,
      encryptionKey: "pending",
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      metadata: {
        version: "1.0.0",
        checksum: "pending",
        tables: ["transactions", "budgets", "goals", "users"],
      },
    }

    setBackups([newBackup, ...backups])

    // Simulate backup process
    setTimeout(() => {
      setBackups((prev) =>
        prev.map((backup) =>
          backup.id === newBackup.id
            ? {
                ...backup,
                status: "completed",
                size: Math.floor(Math.random() * 50000000) + 40000000,
                completedAt: new Date(),
                encryptionKey: "encrypted-key-hash",
                metadata: {
                  ...backup.metadata,
                  checksum: "sha256-" + Math.random().toString(36).substring(7),
                },
              }
            : backup,
        ),
      )
    }, 3000)
  }

  const handleViewAuditLog = (log: AuditLog) => {
    // TODO: Open audit log details modal
    console.log("View audit log:", log)
  }

  return (
    <SecurityDashboard
      auditLogs={auditLogs}
      systemHealth={systemHealth}
      backups={backups}
      securityConfig={securityConfig}
      onUpdateConfig={handleUpdateConfig}
      onCreateBackup={handleCreateBackup}
      onViewAuditLog={handleViewAuditLog}
    />
  )
}
