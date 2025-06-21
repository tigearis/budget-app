import type { PaymentEvent, NotificationPreferences, ReminderTiming } from "@/lib/types/calendar"
import { format, addMinutes, addHours, addDays, addWeeks } from "date-fns"

export class NotificationService {
  private preferences: NotificationPreferences

  constructor(preferences: NotificationPreferences) {
    this.preferences = preferences
  }

  async schedulePaymentReminders(paymentEvent: PaymentEvent): Promise<void> {
    if (!paymentEvent.reminderSettings.enabled) return

    for (const timing of paymentEvent.reminderSettings.timings) {
      const reminderDate = this.calculateReminderDate(paymentEvent.dueDate, timing)

      for (const method of paymentEvent.reminderSettings.methods) {
        await this.scheduleReminder({
          paymentEvent,
          method,
          reminderDate,
          timing,
        })
      }
    }
  }

  private calculateReminderDate(dueDate: Date, timing: ReminderTiming): Date {
    const { value, unit } = timing

    switch (unit) {
      case "minutes":
        return addMinutes(dueDate, -value)
      case "hours":
        return addHours(dueDate, -value)
      case "days":
        return addDays(dueDate, -value)
      case "weeks":
        return addWeeks(dueDate, -value)
      default:
        return addDays(dueDate, -value)
    }
  }

  private async scheduleReminder({
    paymentEvent,
    method,
    reminderDate,
    timing,
  }: {
    paymentEvent: PaymentEvent
    method: string
    reminderDate: Date
    timing: ReminderTiming
  }): Promise<void> {
    const reminderData = {
      id: crypto.randomUUID(),
      paymentEventId: paymentEvent.id,
      userId: paymentEvent.userId,
      method,
      scheduledFor: reminderDate,
      message: this.generateReminderMessage(paymentEvent, timing),
      status: "scheduled",
      createdAt: new Date(),
    }

    try {
      // Schedule the reminder through your background job system
      await fetch("/api/reminders/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reminderData),
      })
    } catch (error) {
      console.error("Failed to schedule reminder:", error)
    }
  }

  private generateReminderMessage(paymentEvent: PaymentEvent, timing: ReminderTiming): string {
    const customMessage = paymentEvent.reminderSettings.customMessage
    if (customMessage) return customMessage

    const amount = paymentEvent.amount.toLocaleString()
    const dueDate = format(paymentEvent.dueDate, "MMM dd, yyyy")

    return `Reminder: ${paymentEvent.title} payment of $${amount} is due ${timing.label} (${dueDate})`
  }

  async sendEmailNotification(
    email: string,
    subject: string,
    message: string,
    paymentEvent: PaymentEvent,
  ): Promise<boolean> {
    if (!this.preferences.email.enabled) return false

    try {
      const response = await fetch("/api/notifications/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: email,
          subject,
          message,
          paymentEventId: paymentEvent.id,
          template: "payment_reminder",
          data: {
            paymentTitle: paymentEvent.title,
            amount: paymentEvent.amount,
            dueDate: format(paymentEvent.dueDate, "MMMM dd, yyyy"),
            description: paymentEvent.description,
          },
        }),
      })

      return response.ok
    } catch (error) {
      console.error("Failed to send email notification:", error)
      return false
    }
  }

  async sendSMSNotification(phoneNumber: string, message: string, paymentEvent: PaymentEvent): Promise<boolean> {
    if (!this.preferences.sms.enabled) return false

    try {
      const response = await fetch("/api/notifications/sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: phoneNumber,
          message,
          paymentEventId: paymentEvent.id,
        }),
      })

      return response.ok
    } catch (error) {
      console.error("Failed to send SMS notification:", error)
      return false
    }
  }

  async sendPushNotification(
    userId: string,
    title: string,
    message: string,
    paymentEvent: PaymentEvent,
  ): Promise<boolean> {
    if (!this.preferences.push.enabled) return false

    try {
      const response = await fetch("/api/notifications/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          title,
          message,
          paymentEventId: paymentEvent.id,
          data: {
            type: "payment_reminder",
            paymentEventId: paymentEvent.id,
          },
        }),
      })

      return response.ok
    } catch (error) {
      console.error("Failed to send push notification:", error)
      return false
    }
  }

  async processScheduledReminders(): Promise<void> {
    try {
      const response = await fetch("/api/reminders/due")
      const dueReminders = await response.json()

      for (const reminder of dueReminders) {
        await this.sendReminder(reminder)
      }
    } catch (error) {
      console.error("Failed to process scheduled reminders:", error)
    }
  }

  private async sendReminder(reminder: any): Promise<void> {
    const { method, message, paymentEvent, userId } = reminder

    switch (method) {
      case "email":
        if (this.preferences.email.enabled) {
          await this.sendEmailNotification(
            this.preferences.email.address,
            `Payment Reminder: ${paymentEvent.title}`,
            message,
            paymentEvent,
          )
        }
        break
      case "sms":
        if (this.preferences.sms.enabled) {
          await this.sendSMSNotification(this.preferences.sms.phoneNumber, message, paymentEvent)
        }
        break
      case "push":
        if (this.preferences.push.enabled) {
          await this.sendPushNotification(userId, "Payment Reminder", message, paymentEvent)
        }
        break
    }

    // Mark reminder as sent
    await fetch(`/api/reminders/${reminder.id}/sent`, {
      method: "POST",
    })
  }

  async generateDailyDigest(userId: string): Promise<void> {
    if (this.preferences.email.frequency !== "daily_digest") return

    try {
      const response = await fetch(`/api/payment-events/upcoming?userId=${userId}&days=7`)
      const upcomingPayments = await response.json()

      if (upcomingPayments.length === 0) return

      const totalAmount = upcomingPayments.reduce((sum: number, payment: PaymentEvent) => sum + payment.amount, 0)

      const digestMessage = this.generateDigestMessage(upcomingPayments, totalAmount)

      await this.sendEmailNotification(
        this.preferences.email.address,
        "Daily Payment Digest",
        digestMessage,
        upcomingPayments[0], // Use first payment for context
      )
    } catch (error) {
      console.error("Failed to generate daily digest:", error)
    }
  }

  private generateDigestMessage(payments: PaymentEvent[], totalAmount: number): string {
    const paymentList = payments
      .map(
        (payment) => `• ${payment.title}: $${payment.amount.toLocaleString()} (${format(payment.dueDate, "MMM dd")})`,
      )
      .join("\n")

    return `You have ${payments.length} upcoming payments totaling $${totalAmount.toLocaleString()}:

${paymentList}

Stay on top of your finances with timely payments!`
  }
}
