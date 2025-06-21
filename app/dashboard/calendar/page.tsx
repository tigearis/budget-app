"use client"

import { useState, useEffect } from "react"
import { PaymentCalendar } from "@/components/calendar/payment-calendar"
import { CashFlowTimeline } from "@/components/calendar/cash-flow-timeline"
import { NotificationSettings } from "@/components/calendar/notification-settings"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type {
  PaymentEvent,
  PaymentAnomaly,
  NotificationPreferences,
  GoogleCalendarConfig,
  RecurringPaymentDetection,
} from "@/lib/types/calendar"
import type { Transaction } from "@/lib/types/transactions"
import { PaymentScheduler } from "@/lib/utils/payment-scheduler"
import { NotificationService } from "@/lib/services/notification-service"
import { GoogleCalendarService } from "@/lib/services/google-calendar"

// Mock data - replace with real data from your GraphQL API
const MOCK_PAYMENT_EVENTS: PaymentEvent[] = [
  {
    id: "1",
    userId: "user1",
    loanId: "loan1",
    title: "Mortgage Payment",
    description: "Monthly mortgage payment",
    amount: 3164,
    dueDate: new Date("2024-02-15"),
    type: "rent_mortgage",
    status: "scheduled",
    category: "Housing",
    isRecurring: true,
    recurringPattern: {
      frequency: "monthly",
      interval: 1,
    },
    reminderSettings: {
      enabled: true,
      methods: ["email", "push"],
      timings: [
        { value: 3, unit: "days", label: "3 days before" },
        { value: 1, unit: "days", label: "1 day before" },
      ],
    },
    metadata: {
      automaticPayment: true,
      accountNumber: "123456789",
    },
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    userId: "user1",
    title: "Car Loan Payment",
    description: "Monthly car loan payment",
    amount: 694,
    dueDate: new Date("2024-02-20"),
    type: "loan_payment",
    status: "scheduled",
    category: "Transportation",
    isRecurring: true,
    recurringPattern: {
      frequency: "monthly",
      interval: 1,
    },
    reminderSettings: {
      enabled: true,
      methods: ["email"],
      timings: [{ value: 2, unit: "days", label: "2 days before" }],
    },
    metadata: {
      automaticPayment: false,
    },
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "3",
    userId: "user1",
    title: "Netflix Subscription",
    description: "Monthly Netflix subscription",
    amount: 15.99,
    dueDate: new Date("2024-02-10"),
    type: "subscription",
    status: "scheduled",
    category: "Entertainment",
    isRecurring: true,
    recurringPattern: {
      frequency: "monthly",
      interval: 1,
    },
    reminderSettings: {
      enabled: false,
      methods: [],
      timings: [],
    },
    metadata: {
      automaticPayment: true,
    },
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-15"),
  },
]

const MOCK_TRANSACTIONS: Transaction[] = [
  // Add some mock transaction data for cash flow analysis
  {
    id: "t1",
    userId: "user1",
    date: new Date("2024-01-15"),
    amount: 5000,
    description: "Salary Payment",
    merchant: "Employer Inc",
    category: "Income",
    type: "income",
    status: "completed",
    account: "Checking",
    balance: 15000,
    metadata: {},
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "t2",
    userId: "user1",
    date: new Date("2024-01-16"),
    amount: -3164,
    description: "Mortgage Payment",
    merchant: "Commonwealth Bank",
    category: "Housing",
    type: "expense",
    status: "completed",
    account: "Checking",
    balance: 11836,
    metadata: {},
    createdAt: new Date("2024-01-16"),
    updatedAt: new Date("2024-01-16"),
  },
]

const MOCK_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  email: {
    enabled: true,
    address: "user@example.com",
    frequency: "immediate",
  },
  sms: {
    enabled: false,
    phoneNumber: "",
    frequency: "immediate",
  },
  push: {
    enabled: true,
    frequency: "immediate",
  },
  calendar: {
    enabled: true,
    reminderMinutes: [15, 60, 1440],
  },
}

const MOCK_GOOGLE_CALENDAR_CONFIG: GoogleCalendarConfig = {
  enabled: false,
  calendarId: "primary",
  syncDirection: "one_way",
  eventPrefix: "💰 ",
  colorId: "5",
  reminderMinutes: [15, 60],
}

export default function CalendarPage() {
  const [paymentEvents, setPaymentEvents] = useState<PaymentEvent[]>(MOCK_PAYMENT_EVENTS)
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS)
  const [anomalies, setAnomalies] = useState<PaymentAnomaly[]>([])
  const [notificationPreferences, setNotificationPreferences] =
    useState<NotificationPreferences>(MOCK_NOTIFICATION_PREFERENCES)
  const [googleCalendarConfig, setGoogleCalendarConfig] = useState<GoogleCalendarConfig>(MOCK_GOOGLE_CALENDAR_CONFIG)
  const [showCreatePayment, setShowCreatePayment] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<PaymentEvent | null>(null)
  const [recurringDetections, setRecurringDetections] = useState<RecurringPaymentDetection[]>([])

  // Services
  const [notificationService, setNotificationService] = useState<NotificationService | null>(null)
  const [googleCalendarService, setGoogleCalendarService] = useState<GoogleCalendarService | null>(null)

  useEffect(() => {
    // Initialize services
    const notifService = new NotificationService(notificationPreferences)
    const calendarService = new GoogleCalendarService(googleCalendarConfig)

    setNotificationService(notifService)
    setGoogleCalendarService(calendarService)

    // Detect anomalies
    const detectedAnomalies = PaymentScheduler.detectAnomalies(paymentEvents, transactions)
    setAnomalies(detectedAnomalies)

    // Detect recurring payments from transactions
    const detections = PaymentScheduler.detectRecurringPayments(transactions)
    setRecurringDetections(detections)
  }, [paymentEvents, transactions, notificationPreferences, googleCalendarConfig])

  const handleCreatePayment = () => {
    setShowCreatePayment(true)
  }

  const handleEditPayment = (payment: PaymentEvent) => {
    setSelectedPayment(payment)
    setShowCreatePayment(true)
  }

  const handleUpdateNotificationPreferences = (preferences: NotificationPreferences) => {
    setNotificationPreferences(preferences)
    // Save to backend
  }

  const handleUpdateGoogleCalendar = (config: GoogleCalendarConfig) => {
    setGoogleCalendarConfig(config)
    // Save to backend
  }

  const handleTestNotification = async (method: string) => {
    if (!notificationService) return

    const testPayment: PaymentEvent = {
      id: "test",
      userId: "user1",
      title: "Test Payment",
      description: "This is a test notification",
      amount: 100,
      dueDate: new Date(),
      type: "other",
      status: "scheduled",
      category: "Test",
      isRecurring: false,
      reminderSettings: {
        enabled: true,
        methods: [method as any],
        timings: [],
      },
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    switch (method) {
      case "email":
        await notificationService.sendEmailNotification(
          notificationPreferences.email.address,
          "Test Payment Reminder",
          "This is a test email notification from your budgeting app.",
          testPayment,
        )
        break
      case "sms":
        await notificationService.sendSMSNotification(
          notificationPreferences.sms.phoneNumber,
          "Test: This is a test SMS notification from your budgeting app.",
          testPayment,
        )
        break
      case "push":
        await notificationService.sendPushNotification(
          "user1",
          "Test Payment Reminder",
          "This is a test push notification from your budgeting app.",
          testPayment,
        )
        break
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList>
          <TabsTrigger value="calendar">Payment Calendar</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="settings">Notification Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <PaymentCalendar
            paymentEvents={paymentEvents}
            anomalies={anomalies}
            onCreatePayment={handleCreatePayment}
            onEditPayment={handleEditPayment}
          />
        </TabsContent>

        <TabsContent value="cashflow">
          <CashFlowTimeline
            paymentEvents={paymentEvents}
            transactions={transactions}
            currentBalance={15000} // This would come from your account data
          />
        </TabsContent>

        <TabsContent value="settings">
          <NotificationSettings
            preferences={notificationPreferences}
            googleCalendarConfig={googleCalendarConfig}
            onUpdatePreferences={handleUpdateNotificationPreferences}
            onUpdateGoogleCalendar={handleUpdateGoogleCalendar}
            onTestNotification={handleTestNotification}
          />
        </TabsContent>
      </Tabs>

      {/* Payment Creation/Edit Modal */}
      <Dialog open={showCreatePayment} onOpenChange={setShowCreatePayment}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Payment creation/edit form would go here */}
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">{selectedPayment ? "Edit Payment" : "Create Payment"}</h2>
            <p className="text-muted-foreground">Payment form would be implemented here</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
