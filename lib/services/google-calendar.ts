import type { PaymentEvent, GoogleCalendarConfig } from "@/lib/types/calendar"

export class GoogleCalendarService {
  private config: GoogleCalendarConfig
  private accessToken: string | null = null

  constructor(config: GoogleCalendarConfig) {
    this.config = config
  }

  async authenticate(): Promise<boolean> {
    try {
      // This would integrate with Google OAuth2
      // For now, we'll simulate the authentication
      const response = await fetch("/api/auth/google-calendar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scope: "https://www.googleapis.com/auth/calendar",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        this.accessToken = data.access_token
        return true
      }
      return false
    } catch (error) {
      console.error("Google Calendar authentication failed:", error)
      return false
    }
  }

  async createPaymentEvent(paymentEvent: PaymentEvent): Promise<string | null> {
    if (!this.accessToken || !this.config.enabled) return null

    try {
      const calendarEvent = this.convertToGoogleCalendarEvent(paymentEvent)

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${this.config.calendarId}/events`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(calendarEvent),
        },
      )

      if (response.ok) {
        const data = await response.json()
        return data.id
      }
      return null
    } catch (error) {
      console.error("Failed to create Google Calendar event:", error)
      return null
    }
  }

  async updatePaymentEvent(paymentEvent: PaymentEvent): Promise<boolean> {
    if (!this.accessToken || !this.config.enabled || !paymentEvent.googleCalendarEventId) {
      return false
    }

    try {
      const calendarEvent = this.convertToGoogleCalendarEvent(paymentEvent)

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${this.config.calendarId}/events/${paymentEvent.googleCalendarEventId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(calendarEvent),
        },
      )

      return response.ok
    } catch (error) {
      console.error("Failed to update Google Calendar event:", error)
      return false
    }
  }

  async deletePaymentEvent(googleCalendarEventId: string): Promise<boolean> {
    if (!this.accessToken || !this.config.enabled) return false

    try {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${this.config.calendarId}/events/${googleCalendarEventId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      )

      return response.ok
    } catch (error) {
      console.error("Failed to delete Google Calendar event:", error)
      return false
    }
  }

  private convertToGoogleCalendarEvent(paymentEvent: PaymentEvent) {
    const startDateTime = new Date(paymentEvent.dueDate)
    startDateTime.setHours(9, 0, 0, 0) // Set to 9 AM

    const endDateTime = new Date(startDateTime)
    endDateTime.setHours(10, 0, 0, 0) // 1 hour duration

    return {
      summary: `${this.config.eventPrefix}${paymentEvent.title}`,
      description: `Payment due: $${paymentEvent.amount.toLocaleString()}\n${paymentEvent.description || ""}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      colorId: this.config.colorId,
      reminders: {
        useDefault: false,
        overrides: this.config.reminderMinutes.map((minutes) => ({
          method: "popup",
          minutes,
        })),
      },
    }
  }

  async syncPaymentEvents(paymentEvents: PaymentEvent[]): Promise<void> {
    if (!this.config.enabled || this.config.syncDirection === "one_way") return

    for (const event of paymentEvents) {
      if (event.googleCalendarEventId) {
        await this.updatePaymentEvent(event)
      } else {
        const googleEventId = await this.createPaymentEvent(event)
        if (googleEventId) {
          // Update the payment event with the Google Calendar event ID
          // This would typically be done through your API
          await this.updatePaymentEventId(event.id, googleEventId)
        }
      }
    }
  }

  private async updatePaymentEventId(paymentEventId: string, googleCalendarEventId: string): Promise<void> {
    try {
      await fetch("/api/payment-events/update-calendar-id", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentEventId,
          googleCalendarEventId,
        }),
      })
    } catch (error) {
      console.error("Failed to update payment event with Google Calendar ID:", error)
    }
  }
}
