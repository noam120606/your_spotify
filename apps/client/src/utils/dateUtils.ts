import { Timesplit } from "../api/types";

export class DateUtils {
  static getPreviousInterval(start: Date, end: Date): [Date, Date] {
    const diffTime = end.getTime() - start.getTime();
    const prevEnd = new Date(start.getTime());
    const prevStart = new Date(start.getTime() - diffTime);
    return [prevStart, prevEnd];
  }

  static generateDateRange(start: Date, end: Date, timeSplit: Timesplit): Date[] {
    const dates: Date[] = [];
    const current = new Date(start.getTime());

    if (timeSplit === Timesplit.hour) {
      current.setMinutes(0, 0, 0);
    } else if (timeSplit === Timesplit.day) {
      current.setHours(0, 0, 0, 0);
    } else if (timeSplit === Timesplit.month) {
      current.setDate(1);
      current.setHours(0, 0, 0, 0);
    } else if (timeSplit === Timesplit.year) {
      current.setMonth(0, 1);
      current.setHours(0, 0, 0, 0);
    }

    const endMs = end.getTime();

    while (current.getTime() <= endMs) {
      dates.push(new Date(current.getTime()));

      if (timeSplit === Timesplit.hour) {
        current.setHours(current.getHours() + 1);
      } else if (timeSplit === Timesplit.day) {
        current.setDate(current.getDate() + 1);
      } else if (timeSplit === Timesplit.month) {
        current.setMonth(current.getMonth() + 1);
      } else if (timeSplit === Timesplit.year) {
        current.setFullYear(current.getFullYear() + 1);
      } else {
        break;
      }
    }

    if (dates.length === 0) {
      dates.push(new Date(current.getTime()));
    }

    return dates;
  }

  static getMapKey(date: Date, timeSplit: Timesplit): string {
    if (timeSplit === Timesplit.hour) {
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
    }
    if (timeSplit === Timesplit.day) {
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }
    return `${date.getFullYear()}-${date.getMonth()}`;
  }
}
