"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  RefreshCw,
  Eye,
  Settings,
  Database,
  Activity,
  Users,
  FileText,
} from "lucide-react"
import type { AuditLog, SystemHealth, DataBackup, SecurityConfig } from "@/lib/types/security"

interface SecurityDashboardProps {
  auditLogs: AuditLog[]
  systemHealth: SystemHealth
  backups: DataBackup[]
  securityConfig: SecurityConfig
  onUpdateConfig: (config: SecurityConfig) => void
  onCreateBackup: () => void
  onViewAuditLog: (log: AuditLog) => void
}

export function SecurityDashboard({
  auditLogs,
  systemHealth,
  backups,
  securityConfig,
  onUpdateConfig,
  onCreateBackup,
  onViewAuditLog,
}: SecurityDashboardProps) {
  const [securityScore, setSecurityScore] = useState(0)
  const [recentAlerts, setRecentAlerts] = useState<AuditLog[]>([])

  useEffect(() => {
    // Calculate security score based on configuration and recent activity
    const score = calculateSecurityScore(securityConfig, auditLogs, systemHealth)
    setSecurityScore(score)

    // Filter recent security alerts
    const alerts = auditLogs.filter((log) => log.severity === "high" || log.severity === "critical").slice(0, 5)
    setRecentAlerts(alerts)
  }, [auditLogs, securityConfig, systemHealth])

  const calculateSecurityScore = (config: SecurityConfig, logs: AuditLog[], health: SystemHealth): number => {
    let score = 0

    // Encryption configuration (30 points)
    if (config.encryption.algorithm === "aes-256-gcm") score += 15
    if (config.encryption.backupEncryption) score += 10
    if (config.encryption.keyRotationInterval <= 90) score += 5

    // Audit configuration (20 points)
    if (config.audit.enabled) score += 10
    if (config.audit.logLevel === "comprehensive") score += 10

    // Access controls (30 points)
    if (config.access.requireMFA) score += 15
    if (config.access.sessionTimeout <= 3600) score += 5
    if (config.access.maxFailedAttempts <= 5) score += 10

    // Backup configuration (20 points)
    if (config.backup.enabled) score += 10
    if (config.backup.encryptBackups) score += 10

    return Math.min(score, 100)
  }

  const getSecurityScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getSecurityScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent"
    if (score >= 70) return "Good"
    if (score >= 50) return "Fair"
    return "Poor"
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage your application security</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCreateBackup}>
            <Database className="h-4 w-4 mr-2" />
            Create Backup
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Security Settings
          </Button>
        </div>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getSecurityScoreColor(securityScore)}`}>{securityScore}%</div>
            <p className="text-xs text-muted-foreground">{getSecurityScoreLabel(securityScore)}</p>
            <Progress value={securityScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {systemHealth.status === "healthy" ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
              <span className="text-2xl font-bold capitalize">{systemHealth.status}</span>
            </div>
            <p className="text-xs text-muted-foreground">{systemHealth.alerts.length} active alerts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Backups</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{backups.filter((b) => b.status === "completed").length}</div>
            <p className="text-xs text-muted-foreground">
              Last: {backups[0] ? formatDate(backups[0].createdAt) : "Never"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{recentAlerts.length}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      {recentAlerts.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>You have {recentAlerts.length} recent security alerts that require attention.</span>
              <Button variant="outline" size="sm">
                View All Alerts
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs defaultValue="audit" className="space-y-4">
        <TabsList>
          <TabsTrigger value="audit">
            <FileText className="h-4 w-4 mr-2" />
            Audit Logs
          </TabsTrigger>
          <TabsTrigger value="backups">
            <Database className="h-4 w-4 mr-2" />
            Backups
          </TabsTrigger>
          <TabsTrigger value="health">
            <Activity className="h-4 w-4 mr-2" />
            System Health
          </TabsTrigger>
          <TabsTrigger value="access">
            <Users className="h-4 w-4 mr-2" />
            Access Control
          </TabsTrigger>
        </TabsList>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Recent Audit Logs</CardTitle>
              <CardDescription>Monitor all system activities and user actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Resource</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.slice(0, 10).map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-sm">{formatDate(log.timestamp)}</TableCell>
                          <TableCell>{log.userId}</TableCell>
                          <TableCell>
                            <code className="text-sm bg-muted px-1 py-0.5 rounded">{log.action}</code>
                          </TableCell>
                          <TableCell>{log.resource}</TableCell>
                          <TableCell>
                            <Badge className={getSeverityColor(log.severity)}>{log.severity}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => onViewAuditLog(log)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backups">
          <Card>
            <CardHeader>
              <CardTitle>Data Backups</CardTitle>
              <CardDescription>Manage your data backups and recovery options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button onClick={onCreateBackup}>
                      <Database className="h-4 w-4 mr-2" />
                      Create Backup
                    </Button>
                    <Button variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Backup Settings
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4">
                  {backups.slice(0, 5).map((backup) => (
                    <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {backup.status === "completed" ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : backup.status === "failed" ? (
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-500" />
                          )}
                          <div>
                            <p className="font-medium">
                              {backup.type === "manual" ? "Manual Backup" : "Automatic Backup"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(backup.createdAt)} • {(backup.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={backup.status === "completed" ? "secondary" : "outline"}>{backup.status}</Badge>
                        {backup.status === "completed" && (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>System Metrics</CardTitle>
                <CardDescription>Real-time system performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">CPU Usage</span>
                      <span className="text-sm text-muted-foreground">{systemHealth.metrics.cpu}%</span>
                    </div>
                    <Progress value={systemHealth.metrics.cpu} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Memory Usage</span>
                      <span className="text-sm text-muted-foreground">{systemHealth.metrics.memory}%</span>
                    </div>
                    <Progress value={systemHealth.metrics.memory} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Disk Usage</span>
                      <span className="text-sm text-muted-foreground">{systemHealth.metrics.disk}%</span>
                    </div>
                    <Progress value={systemHealth.metrics.disk} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Database</span>
                      <span className="text-sm text-muted-foreground">{systemHealth.metrics.database}ms</span>
                    </div>
                    <Progress value={Math.min(systemHealth.metrics.database / 10, 100)} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Response Time</span>
                      <span className="text-sm text-muted-foreground">{systemHealth.metrics.responseTime}ms</span>
                    </div>
                    <Progress value={Math.min(systemHealth.metrics.responseTime / 10, 100)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {systemHealth.alerts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>System Alerts</CardTitle>
                  <CardDescription>Active system alerts and warnings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {systemHealth.alerts.map((alert) => (
                      <Alert key={alert.id}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{alert.message}</p>
                              <p className="text-sm text-muted-foreground">{formatDate(alert.createdAt)}</p>
                            </div>
                            <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="access">
          <Card>
            <CardHeader>
              <CardTitle>Access Control</CardTitle>
              <CardDescription>Manage user permissions and access policies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Security Policies</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Multi-Factor Authentication</span>
                        <Badge variant={securityConfig.access.requireMFA ? "secondary" : "outline"}>
                          {securityConfig.access.requireMFA ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Session Timeout</span>
                        <span className="text-sm text-muted-foreground">
                          {securityConfig.access.sessionTimeout / 60} minutes
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Max Failed Attempts</span>
                        <span className="text-sm text-muted-foreground">{securityConfig.access.maxFailedAttempts}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Password Policy</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Minimum Length</span>
                        <span className="text-sm text-muted-foreground">
                          {securityConfig.access.passwordPolicy.minLength} characters
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Complexity Requirements</span>
                        <div className="flex gap-1">
                          {securityConfig.access.passwordPolicy.requireUppercase && (
                            <Badge variant="outline" className="text-xs">
                              A-Z
                            </Badge>
                          )}
                          {securityConfig.access.passwordPolicy.requireNumbers && (
                            <Badge variant="outline" className="text-xs">
                              0-9
                            </Badge>
                          )}
                          {securityConfig.access.passwordPolicy.requireSpecialChars && (
                            <Badge variant="outline" className="text-xs">
                              !@#
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Access Control
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
