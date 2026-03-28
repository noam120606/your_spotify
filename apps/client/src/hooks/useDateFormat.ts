import { Timesplit } from "../api/types";
import { useAuthStore } from "../store/authStore";

class DateFormatter {
  private locale: string | undefined;
  private timezone: string | undefined;

  constructor(locale: string | undefined, timezone: string | undefined) {
    this.locale = locale;
    this.timezone = timezone;
  }

  toDateTime(date: Date): string {
    return new Intl.DateTimeFormat(this.locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: this.timezone,
    }).format(date);
  }

  toDayMonthYear(date: Date): string {
    return new Intl.DateTimeFormat(this.locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: this.timezone,
    }).format(date);
  }

  toMonthYear(date: Date): string {
    return new Intl.DateTimeFormat(this.locale, {
      month: "2-digit",
      year: "numeric",
      timeZone: this.timezone,
    }).format(date);
  }

  toHour(date: Date): string {
    return new Intl.DateTimeFormat(this.locale, {
      hour: "2-digit",
      timeZone: this.timezone,
    }).format(date);
  }

  toShortDayMonth(date: Date): string {
    return new Intl.DateTimeFormat(this.locale, {
      month: "short",
      day: "numeric",
      timeZone: this.timezone,
    }).format(date);
  }

  toShortMonthYear(date: Date): string {
    return new Intl.DateTimeFormat(this.locale, {
      month: "short",
      year: "numeric",
      timeZone: this.timezone,
    }).format(date);
  }

  formatByTimesplit(date: Date, timesplit: Timesplit): string {
    switch (timesplit) {
      case Timesplit.hour:
        return this.toHour(date);
      case Timesplit.day:
        return this.toShortDayMonth(date);
      case Timesplit.month:
      case Timesplit.year:
      default:
        return this.toShortMonthYear(date);
    }
  }

  formatHour(hour: number): string {
    const date = new Date();
    date.setHours(hour, 0, 0, 0);
    return new Intl.DateTimeFormat(this.locale, {
      hour: "numeric",
      timeZone: this.timezone,
    }).format(date);
  }

  formatDurationMs(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    }
    return `${minutes} min`;
  }
}

export function useDateFormat(): DateFormatter {
  const { user } = useAuthStore();

  const dateFormat = user?.settings?.dateFormat;
  const timezone = user?.settings?.timezone;

  const locale = dateFormat && dateFormat !== "default" ? dateFormat : undefined;
  const tz = timezone || undefined;

  return new DateFormatter(locale, tz);
}
