import { StatMetric } from "../api/types";

export class DurationUtils {
  static formatDurationHoursMinutes(ms: number): string {
    const oneHour = 1000 * 60 * 60;
    const hours = Math.floor(ms / oneHour);
    const minutes = Math.floor((ms % oneHour) / 60000);
    return `${hours}h ${minutes}min`;
  }

  static formatDurationMinutes(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    return `${minutes} min`;
  }

  static formatDurationMinutesSeconds(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  static formatToMetric(duration: number, metric: StatMetric): string {
    if (metric === "duration") {
      return `${this.formatDurationHoursMinutes(duration)}`;
    }
    return `${duration.toLocaleString()} listens`;
  }
}
